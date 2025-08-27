const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const supabase = require('./config/db');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// ✅ Configuración CORREGIDA para Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // ✅ Agregar transports explícitos
  allowEIO3: true // ✅ Compatibilidad con versiones anteriores
});

app.use(cors({origin: '*'}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/delivery', require('./routes/delivery'));

const connectedDeliveries = {};

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET || "missecreto123", (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.id;
    socket.type = decoded.type;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, socket.userId);

  socket.username = socket.handshake.auth.username;

  console.log(`User ${socket.username} (${socket.type}) connected`);

  if (socket.type === 'delivery') {
    connectedDeliveries[socket.userId] = { 
      username: socket.username, 
      lat: null, 
      lng: null,
      socketId: socket.id
    };
    
    io.emit('deliveryConnected', { 
      userId: socket.userId, 
      username: socket.username, 
      lat: null, 
      lng: null 
    });
    
  } else if (socket.type === 'admin') {
    for (const [userId, info] of Object.entries(connectedDeliveries)) {
      socket.emit('deliveryConnected', { 
        userId, 
        username: info.username, 
        lat: info.lat, 
        lng: info.lng 
      });
    }
  }

  socket.on('updateLocation', async (data) => {
    if (socket.type !== 'delivery') return;

    const { lat, lng } = data;
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          lat, 
          lng, 
          last_updated: new Date().toISOString(), 
          active: true 
        })
        .eq('id', socket.userId);

      if (error) {
        console.error('Supabase error:', error.message);
        return;
      }

      if (connectedDeliveries[socket.userId]) {
        connectedDeliveries[socket.userId].lat = lat;
        connectedDeliveries[socket.userId].lng = lng;
      }
      
      io.emit('locationUpdate', { 
        userId: socket.userId, 
        lat, 
        lng 
      });
      
      console.log(`Location updated for user ${socket.userId}: ${lat}, ${lng}`);
    } catch (err) {
      console.error('Socket error:', err);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);

    if (socket.type === 'delivery' && connectedDeliveries[socket.userId]) {
      delete connectedDeliveries[socket.userId];
      io.emit('deliveryDisconnected', { userId: socket.userId });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => { // ✅ Escuchar en 0.0.0.0
  console.log(`Server running on port ${PORT}`);
});