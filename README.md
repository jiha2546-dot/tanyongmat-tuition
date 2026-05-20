# Tanyongmat Tuition Center — Management System

A full web app for managing bookings, students, courses, payments, work logs, and financials.

---

## Roles

| Role | Who | Access |
|------|-----|--------|
| `admin` | Teh Ming | Dashboard, Bookings, Students, Courses & Payments, Work log, Cash log |
| `hannan` | Hannan | Audit, Financials, Payout calculator, Students (read) |
| `tutor` | Our tutors | My schedule, My students |
| `outside` | Outside tutors / parents | Book a table, My bookings |

---

## Setup — Step by step

### Step 1 — Create a Supabase project (free)

1. Go to https://supabase.com and sign up (free)
2. Click **New project**
3. Name it `tanyongmat-tuition`, pick a region (Singapore is closest to Thailand)
4. Choose a strong database password — save it somewhere safe
5. Wait ~2 minutes for the project to start

### Step 2 — Set up the database

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` and paste it in
4. Click **Run** — you should see "Success"

### Step 3 — Create a storage bucket for payment evidence

1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `evidence`
4. Make it **Private** (not public)
5. Click **Create bucket**
6. Click on the bucket → **Policies** → Add these policies:
   - INSERT: authenticated users
   - SELECT: authenticated users

### Step 4 — Create user accounts

Go to **Authentication → Users → Add user** for each person:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Teh Ming | tehming@yourdomain.com | (set strong password) | admin |
| Hannan | hannan@yourdomain.com | (set strong password) | hannan |
| Aiman (tutor) | aiman@yourdomain.com | (set strong password) | tutor |

After creating each user in Auth, you ALSO need to add their profile to the `profiles` table:

1. Go to **Table Editor → profiles**
2. Click **Insert row** for each user:
   - `id` → copy the UUID from Authentication → Users
   - `role` → `admin`, `hannan`, `tutor`, or `outside`
   - `name` → their display name
   - `phone` → optional

### Step 5 — Get your API keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

### Step 6 — Set up the project locally

```bash
# Clone or download this project, then:
cd tanyongmat-tuition

# Install dependencies
npm install

# Copy the env file
cp .env.example .env

# Open .env and paste your Supabase URL and anon key:
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# Run locally to test
npm run dev
```

Open http://localhost:5173 — you should see the login page.

### Step 7 — Deploy to Vercel (free hosting)

1. Go to https://vercel.com and sign up with GitHub
2. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOURUSERNAME/tanyongmat-tuition.git
   git push -u origin main
   ```
3. In Vercel, click **New Project → Import** your GitHub repo
4. Add environment variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**
6. In ~2 minutes you get a live URL like `https://tanyongmat-tuition.vercel.app`

Share this URL with Teh Ming, tutors, and outside parents!

---

## How outside parents book without logging in

Outside tutors and parents can book directly at:
`https://your-vercel-url.vercel.app`

They land on the login page — but you can add a direct booking link that bypasses login:
- Send them the URL with `#book` hash, or
- Add a "Book without account" button on the login page pointing to a public `/book` route

For the simplest setup during demo phase, just give Teh Ming the booking page URL to share with parents via LINE.

---

## Monthly workflow

1. **Daily**: Teh Ming logs income in Cash log + marks work in Work log
2. **Weekly**: Hannan reviews Audit page (check CCTV vs recorded income)
3. **25th of month**: Hannan opens Payout calculator → transfers each person's share
4. **Monthly**: Review student data insights → plan next month's marketing

---

## Files overview

```
src/
├── hooks/
│   ├── useAuth.jsx          — login/logout, user profile
│   ├── useBookings.js       — table bookings CRUD
│   ├── useStudents.js       — students + enrollments CRUD
│   └── useFinancials.js     — cash entries + work log
├── lib/
│   ├── supabase.js          — Supabase client
│   └── utils.js             — shared constants and helpers
├── components/
│   ├── layout/Layout.jsx    — Topbar, Nav, role tabs
│   ├── shared/
│   │   ├── UI.jsx           — Badge, Button, Card, Modal, Table...
│   │   ├── TableGrid.jsx    — table selection with chair/floor split
│   │   └── PaymentModal.jsx — collect payment + upload evidence
│   └── pages/
│       ├── LoginPage.jsx
│       ├── admin/           — Dashboard, Bookings, Students, Enrollments, WorkLog, CashLog
│       ├── hannan/          — Audit, Financials, PayoutCalc
│       ├── tutor/           — MySchedule, MyStudents
│       └── outside/         — BookTable, MyBookings
└── App.jsx                  — main router + data wiring
```
