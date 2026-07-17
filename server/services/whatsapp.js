const twilio = require('twilio');

/**
 * Send a WhatsApp message via Twilio.
 * @param {string} to - Phone number in E.164 format, e.g. +919876543210
 * @param {string} message - The text message body
 * @returns {Promise<string>} - Twilio message SID
 */
async function sendWhatsAppMessage(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM) are not configured.');
  }

  // Validate E.164 format
  const cleaned = to.replace(/\s+/g, '');
  if (!/^\+\d{8,15}$/.test(cleaned)) {
    throw new Error(`Invalid phone number format: "${to}". Must be in E.164 format like +919876543210`);
  }

  const client = twilio(accountSid, authToken);

  const msg = await client.messages.create({
    from,
    to: `whatsapp:${cleaned}`,
    body: message,
  });

  return msg.sid;
}

module.exports = { sendWhatsAppMessage };
