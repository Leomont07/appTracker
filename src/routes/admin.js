const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

router.get('/deliveries', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, active, lat, lng')
      .eq('type', 'delivery')
      .eq('active', true);
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/assign-package', async (req, res) => {
  const { deliveryId, lat, lng } = req.body;
  try {
    const { data, error } = await supabase
      .from('packages')
      .insert({
        lat: lat,
        lng: lng,
        status: 'pendiente',
        assigned_to: deliveryId,
        assigned_at: new Date()
      })
      .select('*, users(username)');
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/packages', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        users:assigned_to (username)
      `)
      .not('status', 'in', '("entregado","regresado")');
    
    if (error) throw error;
    
    const formattedData = data.map(pkg => ({
      ...pkg,
      assigned_to_name: pkg.users ? pkg.users.username : null
    }));
    
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;