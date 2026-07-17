const cron = require('node-cron');
const db = require('../db');
const { sendWhatsAppMessage } = require('./whatsapp');

/**
 * Build a WhatsApp reminder message for an expiring item.
 */
function buildReminderMessage(userName, itemTitle, daysRemaining, expiryDate, appUrl) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const urgencyEmoji = daysRemaining <= 3 ? '🚨' : daysRemaining <= 7 ? '⚠️' : '🔔';

  return `${urgencyEmoji} *Remmbr Reminder*

Hi ${userName}! Your *${itemTitle}* is expiring in *${daysRemaining} day${daysRemaining === 1 ? '' : 's'}* on ${formattedDate}.

Don't let it lapse — log in to take action:
${appUrl || 'https://remmbr.xyz/dashboard'}

_Reply STOP to unsubscribe from reminders._`;
}

/**
 * Run the daily reminder check and send WhatsApp messages.
 */
async function runDailyReminders() {
  console.log('[ReminderCron] Starting daily WhatsApp reminder job...');

  const appUrl = process.env.APP_URL || 'https://remmbr.xyz/dashboard';

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Fetch all active items that are within each user's remind_before_days window
    // and belong to users who have notifications enabled and a phone number set
    const result = await db.query(`
      SELECT
        i.id AS item_id,
        i.title,
        i.expiry_date,
        i.remind_before_days,
        i.notification_enabled AS item_notification_enabled,
        u.id AS user_id,
        u.name AS user_name,
        u.phone,
        u.notification_enabled AS user_notification_enabled,
        u.reminder_days,
        (DATE(i.expiry_date) - CURRENT_DATE) AS days_remaining
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE
        i.status = 'active'
        AND i.notification_enabled = 1
        AND u.notification_enabled = 1
        AND u.phone IS NOT NULL
        AND u.phone != ''
        AND (DATE(i.expiry_date) - CURRENT_DATE) >= 0
        AND (DATE(i.expiry_date) - CURRENT_DATE) <= i.remind_before_days
    `);

    const items = result.rows;
    console.log(`[ReminderCron] Found ${items.length} item(s) due for reminders today.`);

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of items) {
      try {
        // Check if we already sent a notification for this item today
        const logCheck = await db.query(`
          SELECT id FROM notification_logs
          WHERE item_id = $1
            AND user_id = $2
            AND type = 'whatsapp'
            AND status = 'sent'
            AND DATE(sent_at) = $3
        `, [item.item_id, item.user_id, todayStr]);

        if (logCheck.rows.length > 0) {
          console.log(`[ReminderCron] Skipping ${item.title} for user ${item.user_id} — already notified today.`);
          skipped++;
          continue;
        }

        const message = buildReminderMessage(
          item.user_name,
          item.title,
          parseInt(item.days_remaining, 10),
          item.expiry_date,
          appUrl
        );

        const sid = await sendWhatsAppMessage(item.phone, message);

        // Log success
        await db.query(`
          INSERT INTO notification_logs (user_id, item_id, type, status, sent_at)
          VALUES ($1, $2, 'whatsapp', 'sent', NOW())
        `, [item.user_id, item.item_id]);

        console.log(`[ReminderCron] ✅ Sent reminder for "${item.title}" to ${item.phone} (SID: ${sid})`);
        sent++;

      } catch (err) {
        console.error(`[ReminderCron] ❌ Failed to send reminder for "${item.title}":`, err.message);

        // Log failure
        try {
          await db.query(`
            INSERT INTO notification_logs (user_id, item_id, type, status, error)
            VALUES ($1, $2, 'whatsapp', 'failed', $3)
          `, [item.user_id, item.item_id, err.message]);
        } catch (logErr) {
          console.error('[ReminderCron] Could not log failure:', logErr.message);
        }

        failed++;
      }
    }

    console.log(`[ReminderCron] Done. Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}`);
  } catch (err) {
    console.error('[ReminderCron] Fatal error during reminder job:', err);
  }
}

/**
 * Start the cron scheduler.
 * Runs daily at 08:00 AM server time.
 */
function startReminderCron() {
  // Check if Twilio is configured — don't start cron silently if it isn't
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
    console.log('[ReminderCron] ⚠️  Twilio credentials not set — WhatsApp reminder cron will NOT run.');
    console.log('[ReminderCron]    Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env to enable.');
    return;
  }

  // Run at 08:00 AM every day
  cron.schedule('0 8 * * *', () => {
    runDailyReminders().catch(err => console.error('[ReminderCron] Unhandled error:', err));
  }, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[ReminderCron] ✅ Daily WhatsApp reminder cron scheduled for 08:00 AM IST.');
}

module.exports = { startReminderCron, runDailyReminders };
