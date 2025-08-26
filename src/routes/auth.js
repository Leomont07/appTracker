const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const user = data;

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, type: user.type },
      "missecreto123",
      { expiresIn: '1h' }
    );

    res.json({ token, type: user.type , username: user.username });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;