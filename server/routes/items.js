const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/items - Get all items for the user
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, search, sort } = req.query;
    let query = 'SELECT * FROM items WHERE user_id = $1';
    const params = [req.user.id];

    let paramIndex = 2;

    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1} OR reference_number ILIKE $${paramIndex + 2})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    const sortMap = {
      'expiry_asc': 'ORDER BY expiry_date ASC',
      'expiry_desc': 'ORDER BY expiry_date DESC',
      'title': 'ORDER BY title ASC',
      'created': 'ORDER BY created_at DESC',
      'updated': 'ORDER BY updated_at DESC',
    };
    query += ' ' + (sortMap[sort] || "ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, expiry_date ASC");

    const { limit } = req.query;
    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(parsedLimit);
        paramIndex++;
      }
    }

    const result = await db.query(query, params);
    const items = result.rows;

    // Calculate remaining days for each item
    const now = new Date();
    const itemsWithRemaining = items.map(item => {
      const expiry = new Date(item.expiry_date);
      const remaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return {
        ...item,
        days_remaining: remaining,
        is_expired: remaining < 0,
        is_expiring_soon: remaining >= 0 && remaining <= item.remind_before_days
      };
    });

    res.json({ items: itemsWithRemaining });
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ error: 'Server error fetching items' });
  }
});

// GET /api/items/upcoming - Get items expiring soon
router.get('/upcoming', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const now = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await db.query(`
      SELECT * FROM items
      WHERE user_id = $1
        AND status = 'active'
        AND expiry_date BETWEEN $2 AND $3
      ORDER BY expiry_date ASC
    `, [req.user.id, now, future]);

    const nowTime = new Date();
    const itemsWithRemaining = result.rows.map(item => {
      const expiry = new Date(item.expiry_date);
      const remaining = Math.ceil((expiry - nowTime) / (1000 * 60 * 60 * 24));
      return {
        ...item,
        days_remaining: remaining,
        is_expired: remaining < 0,
        is_expiring_soon: remaining >= 0 && remaining <= item.remind_before_days
      };
    });

    res.json({ items: itemsWithRemaining });
  } catch (err) {
    console.error('Upcoming items error:', err);
    res.status(500).json({ error: 'Server error fetching upcoming items' });
  }
});

// GET /api/items/expired - Get expired items
router.get('/expired', auth, async (req, res) => {
  try {
    const now = new Date().toISOString().split('T')[0];
    const result = await db.query(`
      SELECT * FROM items
      WHERE user_id = $1
        AND status = 'active'
        AND expiry_date < $2
      ORDER BY expiry_date ASC
    `, [req.user.id, now]);

    res.json({ items: result.rows });
  } catch (err) {
    console.error('Expired items error:', err);
    res.status(500).json({ error: 'Server error fetching expired items' });
  }
});

// GET /api/items/stats - Get statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Consolidated single query for main metrics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'active' AND expiry_date < $1 THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
        SUM(CASE WHEN status = 'active' AND expiry_date BETWEEN $2 AND $3 THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'active' AND expiry_date BETWEEN $4 AND $5 THEN 1 ELSE 0 END) as critical,
        COALESCE(SUM(CASE WHEN status = 'active' THEN cost ELSE 0 END), 0) as yearlyCost
      FROM items 
      WHERE user_id = $6
    `, [now, now, thirtyDays, now, sevenDays, req.user.id]);

    const baseStats = statsResult.rows[0];

    // Items by category
    const categoryResult = await db.query(`
      SELECT category, COUNT(*) as count FROM items
      WHERE user_id = $1 AND status = 'active'
      GROUP BY category ORDER BY count DESC
    `, [req.user.id]);

    const byCategory = categoryResult.rows.map(row => ({
      ...row,
      count: parseInt(row.count, 10)
    }));

    // Single query to fetch active items expiring within the next 12 months for JS grouping
    const twelveMonthsLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const itemsResult = await db.query(`
      SELECT expiry_date FROM items 
      WHERE user_id = $1 AND status = 'active' AND expiry_date BETWEEN $2 AND $3
    `, [req.user.id, now, twelveMonthsLater]);

    const itemsForMonths = itemsResult.rows;

    // Perform month grouping in JS loop (extremely fast compared to 12 SQL statement preparing & execution)
    const monthly = [];
    for (let i = 0; i < 12; i++) {
      const start = new Date(Date.now());
      start.setMonth(start.getMonth() + i);
      const year = start.getFullYear();
      const month = start.getMonth();

      const count = itemsForMonths.filter(item => {
        const itemDate = new Date(item.expiry_date);
        return itemDate.getFullYear() === year && itemDate.getMonth() === month;
      }).length;

      monthly.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count
      });
    }

    res.json({
      stats: {
        total: parseInt(baseStats.total, 10) || 0,
        active: parseInt(baseStats.active, 10) || 0,
        expired: parseInt(baseStats.expired, 10) || 0,
        archived: parseInt(baseStats.archived, 10) || 0,
        upcoming: parseInt(baseStats.upcoming, 10) || 0,
        critical: parseInt(baseStats.critical, 10) || 0,
        byCategory,
        monthly,
        yearlyCost: parseFloat(baseStats.yearlycost) || 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// POST /api/items - Create a new item
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, reference_number, issuing_authority, issue_date, expiry_date, remind_before_days, cost, notes } = req.body;

    if (!title || !category || !expiry_date) {
      return res.status(400).json({ error: 'Title, category, and expiry date are required' });
    }

    const result = await db.query(`
      INSERT INTO items (user_id, title, category, description, reference_number, issuing_authority, issue_date, expiry_date, remind_before_days, cost, notes, status, notification_enabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', 1) RETURNING id
    `, [
      req.user.id, title, category, description || '', reference_number || '',
      issuing_authority || '', issue_date || null, expiry_date,
      remind_before_days || 7, cost || 0, notes || ''
    ]);

    const itemResult = await db.query('SELECT * FROM items WHERE id = $1', [result.rows[0].id]);
    res.status(201).json({ item: itemResult.rows[0] });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Server error creating item' });
  }
});

// GET /api/items/:id - Get single item
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const item = result.rows[0];
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item });
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ error: 'Server error fetching item' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', auth, async (req, res) => {
  try {
    const existingResult = await db.query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { title, category, description, reference_number, issuing_authority, issue_date, expiry_date, remind_before_days, status, notification_enabled, cost, notes } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (reference_number !== undefined) updates.reference_number = reference_number;
    if (issuing_authority !== undefined) updates.issuing_authority = issuing_authority;
    if (issue_date !== undefined) updates.issue_date = issue_date;
    if (expiry_date !== undefined) updates.expiry_date = expiry_date;
    if (remind_before_days !== undefined) updates.remind_before_days = remind_before_days;
    if (status !== undefined) updates.status = status;
    if (notification_enabled !== undefined) updates.notification_enabled = notification_enabled ? 1 : 0;
    if (cost !== undefined) updates.cost = cost;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClauses = Object.keys(updates).map((k, idx) => `${k} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);
    values.push(req.params.id);

    await db.query(
      `UPDATE items SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`,
      values
    );

    const itemResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    res.json({ item: itemResult.rows[0] });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Server error updating item' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    const existingResult = await db.query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const existing = existingResult.rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await db.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Server error deleting item' });
  }
});

module.exports = router;
