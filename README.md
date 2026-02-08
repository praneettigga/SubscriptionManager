# Subscription Manager

A modern, AI-powered subscription tracking application built with the PERN stack (PostgreSQL/Supabase, Express, React, Node.js).

## Features

- 📊 **Dashboard**: Overview of monthly spending, upcoming renewals, and category breakdown
- 💳 **Subscription Management**: Add, edit, and delete subscriptions with category filtering
- 🤖 **AI-Powered**: 
  - Smart category suggestions when adding subscriptions
  - Spending analysis and recommendations
- 🎨 **Modern UI**: Dark theme with glassmorphism, animations, and responsive design

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Scaledown API (Gemini/OpenAI models)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Scaledown API key (optional, for AI features)

### Setup

1. **Clone and install dependencies**:
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   # In server/.env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SCALEDOWN_API_KEY=your_scaledown_api_key
   PORT=5000
   ```

3. **Create database table** (run in Supabase SQL Editor):
   ```sql
   -- See server/schema.sql for full schema
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Open** `http://localhost:3000`

## Project Structure

```
SubscriptionManager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main app with routing
│   │   └── index.css       # Global styles
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Supabase client
│   ├── routes/             # API routes
│   ├── index.js            # Server entry
│   ├── schema.sql          # Database schema
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/subscriptions` | Get all subscriptions |
| POST   | `/api/subscriptions` | Create subscription |
| PUT    | `/api/subscriptions/:id` | Update subscription |
| DELETE | `/api/subscriptions/:id` | Delete subscription |
| POST   | `/api/ai/categorize` | AI category suggestion |
| POST   | `/api/ai/analyze` | AI spending analysis |

## License

MIT
