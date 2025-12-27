const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Get all requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, type, equipment_id, description } = req.body;
    const result = await pool.query(
      'INSERT INTO maintenance_requests (subject, type, equipment_id, status, requested_by_user_id, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [subject, type, equipment_id, 'new', req.userId, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Move request status
router.patch('/:id/move-status', authMiddleware, async (req, res) => {
  try {
    const { newStatus } = req.body;
    const validStatuses = ['new', 'in_progress', 'repaired', 'scrap', 'closed'];
    
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      'UPDATE maintenance_requests SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [newStatus, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;