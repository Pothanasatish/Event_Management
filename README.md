# 🎪 EventHub - Modern Full-Stack Event Management & RSVP Platform

> **EventHub** is a production-grade, full-stack event discovery, RSVP, ticketing, and check-in platform built with React 18, Node.js, Express, and MongoDB.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20Jest%20Passing-success.svg)](#testing)

---

## 🌟 Key Highlights & Features

### 1. 🎟️ Instant 1-Click RSVPs & Dynamic QR Tickets
- Attendees can RSVP (**Going**, **Maybe**, or **Can't Go**) in under 2 clicks.
- Support for **+1 guests**, optional dietary requirements, and internal notes.
- Instant ticket generation featuring a unique alphanumeric ticket code and **scannable QR code**.
- Download official RFC 5545 iCalendar (`.ics`) file or add directly to Google Calendar.
- Confetti celebration animation on every confirmed booking.

### 2. ⏳ Automated Waitlist Engine
- When an event hits maximum capacity, additional attendees automatically join the priority waitlist.
- If an attendee cancels or changes their status from "Going", the oldest eligible waitlisted candidate is **automatically promoted**, issued an active ticket, and notified via email!

### 3. 📷 Live QR Check-in & Scanner
- Built-in web camera scanning using `html5-qrcode` to verify attendee QR codes at entrance doors.
- Support for fast manual ticket code entry.
- Real-time admission counter (checked in vs expected attendees).
- Sound feedback (high tone for success, warning buzz for duplicates).
- **Double check-in prevention**: warns immediately if a ticket was already used, showing the exact check-in timestamp.

### 4. 🧙 5-Step Event Creation Wizard
- **Step 1: Basics** — Title, rich markdown description, category, and tags.
- **Step 2: Date & Location** — In-person venue (with Google Maps link) or online stream link.
- **Step 3: Tickets & Capacity** — Set capacity, free/paid pricing, and RSVP cutoff deadline.
- **Step 4: Media & Details** — Drag-and-drop cover image upload or URL with live preview; dynamic agenda sessions builder (speaker, time, title, notes).
- **Step 5: Review & Publish** — Live card preview; option to Save as Draft or Publish immediately.

### 5. 📊 Telemetry & Analytics (Organizer & Admin)
- Interactive charts built with **Recharts**:
  - Daily RSVPs over time (Area chart).
  - RSVP status breakdown: Going, Maybe, Declined, Waitlisted (Donut chart).
- Live KPI cards: Total Events, Total RSVPs, Check-in Rate, Upcoming Events.
- CSV export for guest lists and attendance rosters.
- Bulk email invitations with unique 1-click tokenized RSVP links.

### 6. 🌓 Design System & Dark Mode
- Indigo/Violet primary gradients (`#6366F1` → `#8B5CF6`) with warm amber accents.
- Full dark mode and light mode toggle (persists in `localStorage`, respects system preference).
- Glassmorphic navigation and sticky RSVP card.
- Fully responsive across mobile (360px), tablet (768px), and desktop (1440px).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Framer Motion, Axios, date-fns, react-qr-code, canvas-confetti, Recharts, React Hot Toast, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT auth (cookies + Bearer token), bcryptjs, helmet, cors, morgan, express-mongo-sanitize, express-rate-limit, multer, nodemailer, node-cron, ics, qrcode.
- **Testing**: Jest + Supertest (Backend), Vitest + React Testing Library (Frontend).

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+ installed.
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas connection string).

### 2. Installation
Install all dependencies across root, server, and client:
```bash
npm run install:all
```
*(Or run `npm install` in root, `/server`, and `/client`)*

### 3. Environment Setup
Copy the `.env.example` file in the `server` directory:
```bash
cp server/.env.example server/.env
```
Open `server/.env` and paste your MongoDB connection string:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=super_secret_jwt_key_eventhub_enterprise_2025_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Database
Populate the database with realistic sample data (1 Admin, 3 Organizers, 15 Attendees, 8 Categories, 22 Events, and RSVPs):
```bash
npm run seed
```

### 5. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Login Credentials

The seed script creates the following pre-configured accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| 👑 **Admin** | `admin@eventhub.io` | `Password123!` | System oversight, user management & event moderation |
| 💼 **Organizer 1** | `organizer1@eventhub.io` | `Password123!` | Sarah Chen (Tech & AI conferences) |
| 💼 **Organizer 2** | `organizer2@eventhub.io` | `Password123!` | Marcus Vance (Music festivals & sound) |
| 💼 **Organizer 3** | `organizer3@eventhub.io` | `Password123!` | Elena Rostova (Founders & Startups) |
| 🎟️ **Attendee 1** | `liam@example.com` | `Password123!` | Active attendee with confirmed RSVPs & tickets |
| 🎟️ **Attendee 2** | `emma@example.com` | `Password123!` | Active attendee |

> **Pro Tip:** The Login page includes **1-click quick-fill buttons** for each role!

---

## 🧪 Testing

Run both backend and frontend test suites:
```bash
# Run all tests
npm test

# Run frontend tests (Vitest)
npm run test:client

# Run backend tests (Jest)
npm run test:server
```

---

## 📁 Repository Structure

```
Event Management/
├── package.json               # Root scripts (dev, seed, test, install)
├── .env.example               # Root config reference
├── README.md                  # Complete documentation
├── server/
│   ├── server.js              # Express app bootstrap & route configuration
│   ├── config/
│   │   ├── db.js              # Database connection with graceful fallback
│   │   └── mailer.js          # Nodemailer with dev Ethereal preview URLs
│   ├── models/                # User, Event, RSVP, Invite, Category, Comment, etc.
│   ├── controllers/           # Auth, Events, RSVPs, Invites, Analytics, Admin
│   ├── routes/                # Versioned REST API endpoints (/api/v1/...)
│   ├── middleware/            # Auth, RBAC, file upload, error handling
│   ├── utils/                 # Waitlist helper, ICS generator, email templates
│   ├── cron/                  # 24h event reminder cron
│   └── scripts/               # Realistic seed script
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── ui/            # Button, Input, Modal, Drawer, Tabs, Badge, Card, etc.
    │   │   ├── layout/        # Navbar, Sidebar, Footer, ThemeToggle
    │   │   └── shared/        # EventCard, TicketModal, Confetti
    │   ├── context/           # AuthContext, ThemeContext, NotificationContext
    │   ├── services/          # Axios API clients
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── ExploreEventsPage.jsx
    │       ├── EventDetailsPage.jsx
    │       ├── PublicInvitePage.jsx
    │       ├── auth/          # Login, Register, ForgotPassword, ResetPassword
    │       ├── dashboard/     # Overview, Events, Create/Edit Wizard, Guests, Check-in
    │       ├── attendee/      # MyRSVPs, Profile, Settings
    │       ├── admin/         # AdminPanel
    │       └── misc/          # About, Contact, Terms, Privacy, NotFound
```

---

## 📄 License
MIT © EventHub Team
