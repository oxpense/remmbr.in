# ⏰ Renewal Tracker

Never miss a renewal again! Track all your licenses, insurance policies, passports, subscriptions, PUC certificates, bike services, and any other renewable items in one place.

## ✨ Features

- **📊 Dashboard** - At-a-glance overview of all your renewals with stats
- **📋 Item Management** - Add, edit, delete renewal items with full details
- **🏷️ 19+ Categories** - Driving License, Insurance, Passport, Subscriptions, and more
- **🔍 Search & Filters** - Find items by category, status, or search text
- **⏰ Reminder System** - Configurable reminder days for each item
- **📈 Progress Tracking** - See how much validity period has been used
- **💰 Cost Tracking** - Track renewal costs and annual totals
- **🔐 User Authentication** - Secure JWT-based auth with registration
- **📱 WhatsApp Ready** - Phone number field ready for WhatsApp notifications (coming soon)
- **🎨 Modern UI** - Clean, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Setup & Run

```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Build the frontend
npm run build-client

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

### Demo Credentials
- **Email:** demo@example.com
- **Password:** demo123456

### Development Mode (hot reload)

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Frontend dev server: http://localhost:5173 (auto-proxies to backend)

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Auth | JWT + bcrypt |
| Charts | Recharts |

## 📁 Project Structure

```
renewal-tracker/
├── server/
│   ├── index.js           # Express server entry
│   ├── db.js              # Database setup & seed
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   └── routes/
│       ├── auth.js        # Login/Register
│       ├── items.js       # Item CRUD + stats
│       └── categories.js  # Categories list
├── client/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   └── context/       # Auth context
│   └── ...
├── data/                  # SQLite database (auto-created)
├── package.json
└── .env
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Get user profile |
| PUT | /api/auth/settings | Update settings |
| GET | /api/items | List items (filter, search, sort) |
| POST | /api/items | Create item |
| GET | /api/items/:id | Get item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/items/upcoming | Items expiring soon |
| GET | /api/items/stats | Dashboard statistics |
| GET | /api/categories | All categories |
| GET | /api/health | Health check |

## 🌐 Deployment

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new)

1. Push to GitHub
2. Connect repo to Railway
3. Set start command: `npm start`
4. Set build command: `cd client && npm install && npm run build`

### Deploy to Render

1. Push to GitHub
2. Create a new Web Service on Render
3. Build command: `npm run setup`
4. Start command: `npm start`

### Deploy to Fly.io

1. Install flyctl
2. Run `fly launch` in the project directory
3. Run `fly deploy`

### Deploy to Vercel (API + Frontend)

Use the Vercel CLI or connect your GitHub repo.

## 🔮 Roadmap

- [x] Core CRUD for renewal items
- [x] Dashboard with stats & charts
- [x] Category system with icons
- [x] Search & filter functionality
- [ ] **WhatsApp notifications** (via WhatsApp Business API)
- [ ] Email reminders
- [ ] Push notifications (PWA)
- [ ] File upload (documents/images)
- [ ] Multi-language support
- [ ] Dark mode

## 📄 License

MIT
