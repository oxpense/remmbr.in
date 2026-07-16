const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// For admin/stats - get categories with item counts
router.get('/with-counts', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM items WHERE category = c.name AND user_id = $1 AND status = 'active') as active_count,
        (SELECT COUNT(*) FROM items WHERE category = c.name AND user_id = $2) as total_count
      FROM categories c
      ORDER BY active_count DESC, c.name ASC
    `, [req.user.id, req.user.id]);

    // pg returns count as string (bigint), convert to numbers
    const categories = result.rows.map(row => ({
      ...row,
      active_count: parseInt(row.active_count, 10),
      total_count: parseInt(row.total_count, 10)
    }));

    res.json({ categories });
  } catch (err) {
    console.error('Get categories with counts error:', err);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

module.exports = router;
