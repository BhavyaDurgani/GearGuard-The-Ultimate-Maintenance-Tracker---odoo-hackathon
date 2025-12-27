const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get all equipment
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single equipment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get maintenance requests for specific equipment
router.get('/:id/maintenance-requests', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM maintenance_requests WHERE equipment_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark equipment as scrapped
router.patch('/:id/scrap', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE equipment SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      ['scrapped', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create equipment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, serial_number, location, category, maintenance_team_id } = req.body;
    
    if (!maintenance_team_id) {
      return res.status(400).json({ error: 'maintenance_team_id is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO equipment (name, serial_number, location, category, maintenance_team_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, serial_number, location, category, maintenance_team_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;