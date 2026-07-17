const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../services/whatsapp');
const { runDailyReminders } = require('../services/reminderCron');

const router = express.Router();

// POST /api/notifications/test — Send a test WhatsApp message to the logged-in user
router.post('/test', auth, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, name, phone, notification_enabled FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];

    if (!user.phone || user.phone.trim() === '') {
      return res.status(400).json({ error: 'No phone number saved. Please add your phone number in settings first.' });
    }

    const message = `🔔 *Remmbr Test Message*

Hi ${user.name}! This is a test reminder from Remmbr.

Your WhatsApp notifications are now set up correctly. You'll receive reminders like this one before your items expire.

Manage your reminders at: ${process.env.APP_URL || 'https://remmbr.xyz/dashboard'}`;

    const sid = await sendWhatsAppMessage(user.phone.trim(), message);

    // Log the test message
    await db.query(
      `INSERT INTO notification_logs (user_id, item_id, type, status, sent_at)
       SELECT $1, id, 'whatsapp_test', 'sent', NOW() FROM items WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );

    res.json({ success: true, message: `Test WhatsApp sent to ${user.phone}!`, sid });
  } catch (err) {
    console.error('Test notification error:', err);
    res.status(500).json({ error: err.message || 'Failed to send test WhatsApp message' });
  }
});

// GET /api/notifications/logs — Get last 20 notification logs for the user
router.get('/logs', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        nl.id,
        nl.type,
        nl.status,
        nl.sent_at,
        nl.error,
        nl.created_at,
        i.title AS item_title,
        i.category AS item_category
      FROM notification_logs nl
      LEFT JOIN items i ON nl.item_id = i.id
      WHERE nl.user_id = $1
      ORDER BY nl.created_at DESC
      LIMIT 20
    `, [req.user.id]);

    res.json({ logs: result.rows });
  } catch (err) {
    console.error('Notification logs error:', err);
    res.status(500).json({ error: 'Failed to fetch notification logs' });
  }
});

// POST /api/notifications/run — Manually trigger the reminder job (admin use / testing only)
router.post('/run', auth, async (req, res) => {
  // Only allow in non-production or if explicitly unlocked
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MANUAL_CRON !== 'true') {
    return res.status(403).json({ error: 'Manual cron trigger not allowed in production.' });
  }

  try {
    await runDailyReminders();
    res.json({ success: true, message: 'Reminder job completed. Check server logs for details.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
