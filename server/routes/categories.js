const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// For admin/stats - get categories with item counts
router.get('/with-counts', auth, (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM items WHERE category = c.name AND user_id = ? AND status = 'active') as active_count,
        (SELECT COUNT(*) FROM items WHERE category = c.name AND user_id = ?) as total_count
      FROM categories c
      ORDER BY active_count DESC, c.name ASC
    `).all(req.user.id, req.user.id);

    res.json({ categories });
  } catch (err) {
    console.error('Get categories with counts error:', err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

module.exports = router;
