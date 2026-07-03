# SkyJet Flight Recovery

> A self-service flight disruption portal that lets passengers check cancellation status, rebook onto alternate flights, or start a refund — without calling the contact center.

---

## Project Overview

**SkyJet Flight Recovery** is a full-stack web application built for disrupted passengers. When a flight is cancelled or delayed, passengers can:

- Look up their trip instantly using a **PNR + last name**
- View real-time **flight status** and disruption details
- **Rebook** onto the next available alternate flight automatically
- Initiate a **refund** for eligible cancelled bookings
- File a **support ticket** and chat with an **AI-powered agent** (Mistral LLM)
- Staff members get a dedicated **admin dashboard** to manage passengers, bookings, recovery requests, and support tickets

---

## Technology Stack

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | REST API server |
| **Mongoose** | MongoDB ODM |
| **MongoDB / mongodb-memory-server** | Database (persistent or in-memory) |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT-based auth (httpOnly cookies) |
| **svg-captcha** | CAPTCHA for login |
| **Mistral AI API** | AI chatbot ("Talk to an agent") |

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** | Accessible UI component library |
| **framer-motion** | Page transition animations |
| **react-type-animation** | Typing animation on hero |
| **lucide-react** | Icon set |
| **react-router-dom v7** | Client-side routing |

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** *(optional)* — if you skip this, an **in-memory MongoDB** starts automatically

---

## Installation & Local Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/skyjet-flight-recovery.git
cd skyjet-flight-recovery
```

---

### Step 2 — Set up the Server

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and configure:

```env
# Optional: point to a real MongoDB. Remove this line to use in-memory DB instead.
MONGODB_URI=mongodb://127.0.0.1:27017/skyjet-flight-recovery

PORT=4000

# Frontend origins allowed to send credentialed requests (cookies)
CLIENT_ORIGINS=http://localhost:5173,http://localhost:5174

# JWT signing secret — change this before any real deployment
JWT_SECRET=change-me-to-a-long-random-string

# Mistral API key — required for the "Talk to an agent" chat feature
# Get a free key at: https://console.mistral.ai
MISTRAL_API_KEY=your_mistral_api_key_here
```

> **Note:** `MISTRAL_API_KEY` is only required if you want the AI chat feature to work. The rest of the app runs without it.

Seed the database (only needed with a persistent MongoDB — in-memory auto-seeds on startup):

```bash
npm run seed
```

Start the server:

```bash
npm run dev    # Runs at http://localhost:4000
```

---

### Step 3 — Set up the Client

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

`client/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev    # Runs at http://localhost:5173
```

---

### Step 4 — Open in browser

Navigate to **http://localhost:5173**

---

## Default Credentials

### Staff / Admin Account

| Field | Value |
|---|---|
| **Email** | `staff@skyjet.com` |
| **Password** | `password123` |
| **Role** | Staff (access to `/admin` dashboard) |

Login at `/login` → you'll be redirected to the **Staff Dashboard** automatically.

---

### Passenger Account

| Field | Value |
|---|---|
| **Email** | `passenger@skyjet.com` |
| **Password** | `password123` |
| **Role** | Passenger (access to `/dashboard`) |

Or, create your own account via the **Register** page — no email verification needed locally.

---

## Demo PNR Lookup (Guest / No Login Required)

Use these PNR + last name pairs on the homepage to test different disruption scenarios:

| PNR | Last Name | Scenario |
|---|---|---|
| `SJONT1` | `Shah` | On-time flight |
| `SJDLY1` | `Fernandes` | Delayed flight |
| `SJRBK1` | `Mehta` | Cancelled — auto-rebook eligible |
| `SJESC1` | `Nair` | Cancelled — no alternate → escalated to agent |
| `SJINT1` | `Rodrigues` | Cancelled — international/special fare → escalated |
| `SJRFD1` | `Khan` | Cancelled — refund eligible |

---

## Project Structure

```
skyjet-flight-recovery/
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets (favicon, icons)
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth + Trip session contexts
│   │   ├── pages/           # Route-level page components
│   │   ├── types/           # Shared TypeScript types
│   │   └── index.css        # Global styles + design tokens
│   └── package.json
│
└── server/                  # Node.js + Express backend
    ├── src/
    │   ├── routes/          # Express route handlers
    │   ├── models/          # Mongoose models
    │   ├── middleware/       # Auth, error handling
    │   └── seed/            # Database seeder
    └── package.json
```

---

## Available Scripts

### Server
| Command | Description |
|---|---|
| `npm run dev` | Start server with hot-reload (`node --watch`) |
| `npm run start` | Start server in production mode |
| `npm run seed` | Seed the database with demo data |

### Client
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Database Options

| Mode | How to enable | Notes |
|---|---|---|
| **In-memory** (default) | Leave `MONGODB_URI` unset in `.env` | Auto-seeds on every start. Data resets on restart. |
| **Persistent (local)** | Set `MONGODB_URI=mongodb://127.0.0.1:27017/skyjet-flight-recovery` | Requires MongoDB installed locally. Run `npm run seed` once. |
| **MongoDB Atlas** | Set `MONGODB_URI=mongodb+srv://...` | Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas). Run `npm run seed` once. |

---

## Future Enhancements

- [ ] **Email notifications** — confirm rebooking/refunds via email (Nodemailer / SendGrid)
- [ ] **Real-time flight status** — integrate a live flight data API (e.g. AviationStack, FlightAware)
- [ ] **Mobile app** — React Native client reusing the same REST API
- [ ] **Refund processing** — connect to a real payment gateway (Stripe) for automated refunds
- [ ] **Multi-language support** — i18n for international passengers
- [ ] **Seat selection** — allow passengers to choose a seat when rebooking
- [ ] **Push notifications** — browser/PWA push alerts for flight status changes
- [ ] **Admin analytics** — dashboard charts for disruption trends, recovery rates
- [ ] **OAuth login** — Sign in with Google / Apple
- [ ] **Rate limiting & WAF** — production-grade security hardening

---

## License

MIT — free to use for personal and commercial projects.
