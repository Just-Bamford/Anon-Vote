# AnonVote

**Private Decision Infrastructure for Organizations on Stellar**

AnonVote is a privacy-preserving voting platform that lets institutions — schools, companies, and communities — run secure anonymous votes with verifiable, tamper-proof results recorded on the Stellar blockchain.

---

## Why AnonVote

Most digital voting tools expose voter identity, store results centrally, and offer no real verification. AnonVote is built differently:

- **One person, one vote** — enforced cryptographically, not by policy
- **Votes stay private** — identity is separated from ballot at every layer
- **Results are verifiable** — anyone can confirm outcomes via Stellar transaction records
- **Records are immutable** — nothing can be altered after submission

---

## Who It's For

| Sector          | Use Cases                                                 |
| --------------- | --------------------------------------------------------- |
| **Education**   | Student elections, faculty votes, course feedback         |
| **Corporate**   | Policy votes, leadership surveys, board approvals         |
| **Communities** | Governance decisions, membership votes, program approvals |

---

## How It Works

```
Eligible Voter List
       │
       ▼
 Identity Manager ──► Anonymous Token (one per voter)
       │
       ▼
  Vote Submission ──► Encrypted Vote Record
       │
       ▼
 Stellar Blockchain ──► Immutable Audit Trail
       │
       ▼
  Result Engine ──► Public Verified Results
```

1. An **Administrator** registers their organization and creates a ballot with a topic, options, deadline, and eligible voter list
2. Each eligible voter receives a **one-time anonymous token** — no identity is stored alongside it
3. Voters use their token to **submit an encrypted vote** — the token is marked used, preventing double voting
4. After the deadline, votes are **automatically tallied** and results published
5. Anyone can **verify the result** via the public verification page and Stellar transaction links

---

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React 18, Vite, TailwindCSS, React Router v6          |
| Backend    | Node.js 20, Express, TypeScript                       |
| Database   | PostgreSQL 15 + Prisma ORM                            |
| Blockchain | Stellar SDK (Testnet / Mainnet)                       |
| Auth       | JWT via HTTP-only cookies, bcrypt                     |
| Crypto     | AES-256-GCM vote encryption, SHA-256 identity hashing |

---

## Project Structure

```
AnonVote/
├── backend/              # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (identity, ballot, privacy, result engines)
│   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   └── utils/        # Crypto helpers, deadline scheduler
│   └── prisma/           # Database schema
├── frontend/             # React SPA
│   └── src/
│       ├── pages/        # All 8 UI pages
│       ├── components/   # Reusable UI components
│       ├── hooks/        # useAuth, useBallot
│       └── api/          # Axios API client
├── shared/               # Shared TypeScript types
├── docker-compose.yml    # PostgreSQL local setup
└── .env.example          # Environment variable template
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- A Stellar account (Testnet for development)

### 1. Clone the repo

```bash
git clone https://github.com/Just-Bamford/AnonVote.git
cd AnonVote
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/anonvote
JWT_SECRET=your-secret-here
STELLAR_SECRET_KEY=your-stellar-secret-key
BALLOT_ENCRYPTION_KEY=your-32-byte-hex-key
NODE_ENV=development
```

### 3. Start the database

```bash
docker-compose up -d
```

### 4. Install dependencies and run migrations

```bash
# Backend
cd backend
npm install
npx prisma migrate dev

# Frontend
cd ../frontend
npm install
```

### 5. Start the development servers

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## API Overview

| Method | Endpoint                    | Auth    | Description            |
| ------ | --------------------------- | ------- | ---------------------- |
| POST   | `/api/organizations`        | —       | Register organization  |
| POST   | `/api/organizations/login`  | —       | Admin login            |
| POST   | `/api/organizations/logout` | Session | Admin logout           |
| GET    | `/api/ballots`              | Session | List org ballots       |
| POST   | `/api/ballots`              | Session | Create ballot          |
| GET    | `/api/ballots/:id`          | —       | Get ballot (public)    |
| POST   | `/api/eligibility`          | Session | Upload voter list      |
| POST   | `/api/tokens`               | —       | Request voter token    |
| POST   | `/api/votes`                | —       | Submit vote            |
| GET    | `/api/results/:ballotId`    | —       | Get published result   |
| GET    | `/api/audit/:ballotId`      | —       | Get audit event counts |

---

## Privacy Design

- Voter identifiers are **SHA-256 hashed** before storage — originals are never recoverable
- Voter tokens are **32-byte CSPRNG values** — only their hash is stored
- There is **no database join** between the eligibility table and the token table — unlinkability is structural, not just policy
- Vote payloads are **AES-256-GCM encrypted** — tallying decrypts only the option selection
- Audit logs record **event counts only** — no identity, no token values

---

## Stellar Integration

All votes and audit events are written to the Stellar blockchain as `manageData` operations on a dedicated AnonVote account. Each record gets a Stellar transaction ID that is stored in the database and surfaced on the public verification page — so anyone can independently confirm results without trusting AnonVote's servers.

Stellar Testnet is used for development. Switch to Mainnet by updating `STELLAR_SECRET_KEY` and the network passphrase in config.

---

## Roadmap

- [x] Organization registration and admin auth
- [x] Ballot creation with eligibility list upload
- [x] Anonymous token issuance
- [x] Encrypted vote submission
- [x] Stellar blockchain recording
- [x] Automatic tally and result publication
- [x] Public verification page
- [ ] Weighted voting system
- [ ] Delegated voting
- [ ] Multi-round / ranked-choice voting
- [ ] Blind vote verification (voter self-verification without identity exposure)

---

## License

MIT
