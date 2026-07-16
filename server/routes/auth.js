const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper to check for Gmail accounts
const isGmail = (email) => {
  return email.toLowerCase().endsWith('@gmail.com') || email.toLowerCase() === 'demo@example.com';
};

// Setup nodemailer transporter
const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 10000, // 10 seconds timeout
      greetingTimeout: 10000,   // 10 seconds greeting timeout
      socketTimeout: 15000      // 15 seconds socket activity timeout
    });
  }
  return null;
};

// POST /api/auth/send-otp - Request an OTP for registration or password reset
router.post('/send-otp', async (req, res) => {
  try {
    const { email, action } = req.body;

    if (!email || !action) {
      return res.status(400).json({ error: 'Email and action are required' });
    }

    if (!isGmail(email)) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }

    // Check constraints depending on action
    const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    const userExists = existingResult.rows.length > 0;

    if (action === 'register' && userExists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    if (action === 'forgot_password' && !userExists) {
      return res.status(404).json({ error: 'This email is not registered' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save to OTP table, delete any previous OTP for this email
    await db.query('DELETE FROM otps WHERE email = $1', [email.toLowerCase()]);
    await db.query(
      'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), otpCode, expiresAt]
    );

    // Try sending email
    const transporter = createTransporter();
    let emailSent = false;
    let errorMsg = null;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Remmbr Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your Remmbr Verification Code',
          text: `Your verification code is ${otpCode}. It will expire in 5 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #6366f1; text-align: center;">Remmbr Verification</h2>
              <p>Hello,</p>
              <p>You requested a code to verify your action on Remmbr. Use the 6-digit code below to complete the action:</p>
              <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; margin: 20px 0; color: #1f2937;">
                ${otpCode}
              </div>
              <p style="color: #6b7280; font-size: 12px; text-align: center;">This code will expire in 5 minutes. If you did not request this, you can ignore this email.</p>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP sending failed:', err);
        errorMsg = err.message || err.toString();
      }
    } else {
      errorMsg = 'SMTP environment variables are not set or loaded';
    }

    console.log(`[Remmbr OTP log] Code for ${email} is: ${otpCode}`);

    // Return response. Expose OTP code in response ONLY in development mode.
    if (!emailSent) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          error: `Email verification service is failing: ${errorMsg}.`
        });
      } else {
        return res.json({
          success: true,
          message: 'OTP generated (Dev fallback).',
          demoOtp: otpCode
        });
      }
    }

    res.json({
      success: true,
      message: 'OTP sent to your Gmail account!'
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Server error generating OTP' });
  }
});

// POST /api/auth/register-verify - Verify OTP and complete registration (Gmail + OTP required)
router.post('/register-verify', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ error: 'All fields (name, email, password, otp) are required' });
    }

    if (!isGmail(email)) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }

    // Verify OTP
    const otpResult = await db.query(
      'SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()',
      [email.toLowerCase(), otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Check if email was registered by someone else in the meantime
    const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Delete OTP
    await db.query('DELETE FROM otps WHERE email = $1', [email.toLowerCase()]);

    // Create User
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [name, email.toLowerCase(), passwordHash]
    );
    const userId = userResult.rows[0].id;

    const token = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, name, email: email.toLowerCase() }
    });
  } catch (err) {
    console.error('Verify registration error:', err);
    res.status(500).json({ error: 'Server error verifying registration' });
  }
});

// POST /api/auth/login - Frictionless login with Email and Password only (NO OTP REQUIRED)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if email is Gmail-compliant (or demo)
    if (!isGmail(email)) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/reset-password - Verify reset OTP and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
    }

    if (!isGmail(email)) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate OTP
    const otpResult = await db.query(
      'SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND expires_at > NOW()',
      [email.toLowerCase(), otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Delete OTP
    await db.query('DELETE FROM otps WHERE email = $1', [email.toLowerCase()]);

    // Update user password
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [passwordHash, email.toLowerCase()]
    );

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { phone, notification_enabled, reminder_days, name } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (notification_enabled !== undefined) updates.notification_enabled = notification_enabled ? 1 : 0;
    if (reminder_days !== undefined) updates.reminder_days = reminder_days;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClauses = Object.keys(updates).map((k, idx) => `${k} = $${idx + 1}`).join(', ');
    const values = Object.values(updates);
    values.push(req.user.id);

    await db.query(
      `UPDATE users SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`,
      values
    );

    const userResult = await db.query(
      'SELECT id, name, email, phone, notification_enabled, reminder_days FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: userResult.rows[0] });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ error: 'Server error updating settings' });
  }
});

module.exports = router;
