const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create a connection pool using the DATABASE_URL connection string from NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for secure cloud DB connections like Neon
  }
});

// A wrapper query helper to match database calls
const query = (text, params) => pool.query(text, params);

// Database Initialization function
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        notification_enabled INTEGER DEFAULT 0,
        reminder_days INTEGER DEFAULT 7,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        reference_number VARCHAR(255) DEFAULT '',
        issuing_authority VARCHAR(255) DEFAULT '',
        issue_date DATE,
        expiry_date DATE NOT NULL,
        remind_before_days INTEGER DEFAULT 7,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
        notification_enabled INTEGER DEFAULT 1,
        cost DOUBLE PRECISION DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        icon VARCHAR(50) DEFAULT '📄',
        color VARCHAR(50) DEFAULT '#6366f1'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        type VARCHAR(50) DEFAULT 'whatsapp',
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Categories
    const categoryCountResult = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoryCountResult.rows[0].count, 10) === 0) {
      const defaultCategories = [
        ['Driving License', '🚗', '#3b82f6'],
        ['Vehicle Insurance', '🛡️', '#10b981'],
        ['Passport', '🛂', '#8b5cf6'],
        ['PUC (Pollution)', '🌿', '#22c55e'],
        ['Bike Service', '🏍️', '#f59e0b'],
        ['Car Insurance', '🚙', '#ef4444'],
        ['Health Insurance', '🏥', '#ec4899'],
        ['Life Insurance', '❤️', '#e11d48'],
        ['Credit Card', '💳', '#6366f1'],
        ['Subscription', '📺', '#a855f7'],
        ['Domain / Hosting', '🌐', '#06b6d4'],
        ['Visa', '✈️', '#14b8a6'],
        ['ID Card', '🪪', '#64748b'],
        ['Birth Certificate', '📜', '#f97316'],
        ['Property Tax', '🏠', '#78716c'],
        ['Professional License', '📋', '#0ea5e9'],
        ['Software License', '💻', '#8b5cf6'],
        ['Insurance (Other)', '📄', '#d946ef'],
        ['Other', '📌', '#6b7280']
      ];

      for (const [name, icon, color] of defaultCategories) {
        await client.query(
          'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
          [name, icon, color]
        );
      }
    }

    // Seed Demo User and demo items
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountResult.rows[0].count, 10) === 0) {
      const salt = bcrypt.genSaltSync(12);
      const hash = bcrypt.hashSync('demo123456', salt);
      const userInsert = await client.query(
        'INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Demo User', 'demo@example.com', hash, '+911234567890']
      );
      const demoUserId = userInsert.rows[0].id;

      // Add demo items
      const today = new Date();
      const addDays = (d, days) => {
        const date = new Date(d);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
      };

      const demoItems = [
        [demoUserId, 'Driver License', 'Driving License', 'Class 2 Motorcycle & Car License', 'DL-1234-56789', 'RTO Mumbai', addDays(today, -365*3), addDays(today, 90), 30, 'active', 500, 'Renew online via Parivahan website'],
        [demoUserId, 'Car Insurance (Comprehensive)', 'Car Insurance', 'Honda City Comprehensive Insurance', 'POL-2024-001', 'ICICI Lombard', addDays(today, -180), addDays(today, 45), 15, 'active', 18500, 'No claims bonus accumulated'],
        [demoUserId, 'Passport', 'Passport', 'Indian Passport', 'Z-1234567', 'Regional Passport Office', addDays(today, -365*5), addDays(today, 180), 60, 'active', 1500, 'Check for police verification appointment'],
        [demoUserId, 'Netflix Subscription', 'Subscription', 'Netflix Premium Plan - 4K', 'SUB-NF-001', 'Netflix', addDays(today, -30), addDays(today, 20), 5, 'active', 649, 'Share with family members'],
        [demoUserId, 'Bike Service', 'Bike Service', 'Royal Enfield Classic 350 - 6 Month Service', 'SVC-001', 'Royal Enfield Service Center', addDays(today, -150), addDays(today, 30), 7, 'active', 2500, 'Book service appointment online'],
        [demoUserId, 'PUC Certificate', 'PUC (Pollution)', 'Pollution Under Control Certificate for Bike', 'PUC-2024-BK-001', 'Authorized PUC Center', addDays(today, -60), addDays(today, 330), 7, 'active', 100, 'Available at any petrol pump'],
        [demoUserId, 'AWS Domain Renewal', 'Domain / Hosting', 'myportfolio.com domain renewal', 'DOM-2024', 'AWS Route 53', addDays(today, -365), addDays(today, 15), 10, 'active', 1200, 'Auto-renew enabled - verify payment method'],
        [demoUserId, 'Health Insurance', 'Health Insurance', 'Family Health Insurance Plan', 'HLTH-2024-001', 'Star Health Insurance', addDays(today, -200), addDays(today, 60), 20, 'active', 25000, 'Covers family of 4 - ₹5L coverage'],
        [demoUserId, 'Expired Domain', 'Domain / Hosting', 'old-blog.com domain', 'DOM-OLD-001', 'GoDaddy', addDays(today, -400), addDays(today, -30), 7, 'expired', 800, 'Let this expire - not needed anymore'],
      ];

      for (const item of demoItems) {
        await client.query(`
          INSERT INTO items (user_id, title, category, description, reference_number, issuing_authority, issue_date, expiry_date, remind_before_days, status, cost, notes, notification_enabled)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1)
        `, item);
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database migration/seeding failed:', e);
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool,
  initDatabase
};
