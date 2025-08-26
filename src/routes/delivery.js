const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, "missecreto123");
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

router.use(authenticateToken);

router.get('/packages', async (req, res) => {
  try {
    console.log('User ID:', req.user.id);
    
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('assigned_to', req.user.id);
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error in /packages:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/update-status/:packageId', async (req, res) => {
  const { status } = req.body;
  const { packageId } = req.params;
  
  try {
    console.log('Updating status:', { packageId, status, userId: req.user.id });
    
    const { data, error } = await supabase
      .from('packages')
      .update({ 
        status: status
      })
      .eq('id', packageId)
      .eq('assigned_to', req.user.id)
      .select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'Package not found or not assigned to you' });
    }
    
    res.json(data[0]);
  } catch (err) {
    console.error('Error in /update-status:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/update-location', async (req, res) => {
  const { lat, lng } = req.body;
  
  try {
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        lat: lat, 
        lng: lng, 
        last_updated: new Date(), 
        active: true 
      })
      .eq('id', req.user.id)
      .select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    if (data.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: 'Location updated successfully',
      user: data[0]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;