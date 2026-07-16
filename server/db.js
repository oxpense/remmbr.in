const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'renewal-tracker.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT DEFAULT '',
    notification_enabled INTEGER DEFAULT 0,
    reminder_days INTEGER DEFAULT 7,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    reference_number TEXT DEFAULT '',
    issuing_authority TEXT DEFAULT '',
    issue_date TEXT,
    expiry_date TEXT NOT NULL,
    remind_before_days INTEGER DEFAULT 7,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'archived')),
    notification_enabled INTEGER DEFAULT 1,
    cost REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📄',
    color TEXT DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    type TEXT DEFAULT 'whatsapp',
    status TEXT DEFAULT 'pending',
    sent_at DATETIME,
    error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  );
`);

// Seed default categories if empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)');
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

  const insertMany = db.transaction((categories) => {
    for (const [name, icon, color] of categories) {
      insertCategory.run(name, icon, color);
    }
  });
  insertMany(defaultCategories);
}

// Create demo user for testing if none exists
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('demo123456', salt);
  db.prepare('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)').run(
    'Demo User', 'demo@example.com', hash, '+911234567890'
  );

  // Add some demo items
  const today = new Date();
  const addDays = (d, days) => {
    const date = new Date(d);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const insertItem = db.prepare(`
    INSERT INTO items (user_id, title, category, description, reference_number, issuing_authority, issue_date, expiry_date, remind_before_days, status, cost, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoItems = [
    [1, 'Driver License', 'Driving License', 'Class 2 Motorcycle & Car License', 'DL-1234-56789', 'RTO Mumbai', addDays(today, -365*3), addDays(today, 90), 30, 'active', 500, 'Renew online via Parivahan website'],
    [1, 'Car Insurance (Comprehensive)', 'Car Insurance', 'Honda City Comprehensive Insurance', 'POL-2024-001', 'ICICI Lombard', addDays(today, -180), addDays(today, 45), 15, 'active', 18500, 'No claims bonus accumulated'],
    [1, 'Passport', 'Passport', 'Indian Passport', 'Z-1234567', 'Regional Passport Office', addDays(today, -365*5), addDays(today, 180), 60, 'active', 1500, 'Check for police verification appointment'],
    [1, 'Netflix Subscription', 'Subscription', 'Netflix Premium Plan - 4K', 'SUB-NF-001', 'Netflix', addDays(today, -30), addDays(today, 20), 5, 'active', 649, 'Share with family members'],
    [1, 'Bike Service', 'Bike Service', 'Royal Enfield Classic 350 - 6 Month Service', 'SVC-001', 'Royal Enfield Service Center', addDays(today, -150), addDays(today, 30), 7, 'active', 2500, 'Book service appointment online'],
    [1, 'PUC Certificate', 'PUC (Pollution)', 'Pollution Under Control Certificate for Bike', 'PUC-2024-BK-001', 'Authorized PUC Center', addDays(today, -60), addDays(today, 330), 7, 'active', 100, 'Available at any petrol pump'],
    [1, 'AWS Domain Renewal', 'Domain / Hosting', 'myportfolio.com domain renewal', 'DOM-2024', 'AWS Route 53', addDays(today, -365), addDays(today, 15), 10, 'active', 1200, 'Auto-renew enabled - verify payment method'],
    [1, 'Health Insurance', 'Health Insurance', 'Family Health Insurance Plan', 'HLTH-2024-001', 'Star Health Insurance', addDays(today, -200), addDays(today, 60), 20, 'active', 25000, 'Covers family of 4 - ₹5L coverage'],
    [1, 'Expired Domain', 'Domain / Hosting', 'old-blog.com domain', 'DOM-OLD-001', 'GoDaddy', addDays(today, -400), addDays(today, -30), 7, 'expired', 800, 'Let this expire - not needed anymore'],
  ];

  const insertDemoItems = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(...item);
    }
  });
  insertDemoItems(demoItems);
}

module.exports = db;
