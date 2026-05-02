# Changelog

All notable changes to AnonVote will be documented here.

---

## v1.1.0

### Improved

- **Complete frontend UI redesign** — Dark and light mode support with theme toggle
- **New design system** — Space Grotesk (headings), DM Sans (body), JetBrains Mono (monospace)
- **Framer-inspired dark mode** — Electric blue accents (#1c7ed6), pure black canvas (#000000), engineered precision
- **Apple-inspired light mode** — Clean surfaces, premium white space (#f5f5f7), ink type hierarchy
- **Improved error and success message components** — Consistent design system classes with proper icon sizing
- **Sticky navbar** — Fixed at top with frosted glass effect (backdrop-filter blur)
- **New footer** — Two-column layout with copyright/credit and navigation links
- **Password visibility toggle** — Eye icon on login and registration pages
- **Input field icon fixes** — Icons now correctly positioned inside fields
- **401 interceptor** — No longer redirects on public routes (login, register, token request)
- **Theme persistence** — Theme toggle now persists across sessions via localStorage
- **Dark mode toggle** — Manual toggle in navbar with sun/moon icon, persists user preference
- **PageLoader component** — Animated SVG loader with rose curve pattern and particle trail

### Fixed

- Input field icons now correctly positioned inside fields
- 401 interceptor no longer redirects on public routes
- Theme toggle now persists across sessions via localStorage

---

## v1.0.0

### Released

- **Organization registration and login** — Secure authentication with bcrypt password hashing
- **Ballot creation** — Dynamic options, eligibility list upload, voting deadline
- **Anonymous token-based voting** — One-time tokens with SHA-256 hashing
- **Results page** — Vote counts and percentages with visual breakdown
- **Stellar blockchain verification** — Tamper-proof results with public transaction IDs
- **Audit page** — Ballot transparency with event tracking
- **AES-256-GCM encryption** — Vote payloads encrypted with organization-specific key
- **SHA-256 voter token hashing** — No raw tokens stored in database
- **Eligibility list upload** — CSV/plain-text validation with injection prevention
- **Rate limiting** — Strict rate limiter (3 req/min) for vote submission
- **Session management** — JWT-based sessions with 8-hour expiration
- **Audit event tracking** — TOKEN_ISSUED, VOTE_CAST, RESULT_PUBLISHED events
- **Duplicate attempt detection** — Prevents token reuse and vote duplication

---

## v0.1.0

### Initial Development

- **Backend scaffolding** — Express.js with TypeScript
- **Prisma ORM setup** — PostgreSQL with Supabase connection
- **Core services** — Ballot engine, privacy engine, result engine, identity manager
- **Stellar integration** — Testnet blockchain for immutable audit trail
- **Frontend scaffolding** — React with Vite, TypeScript, Tailwind CSS
- **API client** — TypeScript client with axios interceptors
- **Theme context** — Dark/light mode toggle with localStorage persistence

---

## v1.2.0

### Added

- **Notification system** — App-wide notification management with `NotificationContext`
  - `NotificationContext.tsx` — Stores notifications in state with types: `ballot_created`, `ballot_closed`, `results_published`, `token_requested`, `warning`
  - `NotificationDropdown.tsx` — Reusable notification dropdown component
  - `useNotifications()` hook — Access notifications, unread count, mark all as read, add notification
  - LocalStorage persistence for notifications
  - 3 seed notifications on first load

- **Navbar redesign** — Replaced standalone Logout button and theme toggle with new elements:
  - **Notification Bell** — Bell icon with red dot indicator for unread notifications
    - Clicking opens notification dropdown overlay (no page navigation)
    - Shows up to 10 most recent notifications
    - "Mark all as read" button at top
    - Click-outside detection to close dropdown
  - **User Avatar / Profile Button** — Circular avatar showing first letter of org name
    - Background: `var(--brand-primary)`, text: white, font: `var(--font-display)`
    - Dropdown with: Profile & Settings, Theme toggle, Logout
    - Click-outside detection to close dropdown

- **Auth state enhancement** — Added `orgEmail` to `useAuth()` hook
  - Fetches email from `getMe()` API response
  - Updated all state updates to include `orgEmail`

### Improved

- **Consistent dropdown styling** — Both notification and profile dropdowns use same base classes:
  - `navbar-dropdown` — Shared positioning, z-index, animation
  - `navbar-dropdown-item` — Consistent hover effects and transitions
  - `navbar-dropdown-divider` — Uniform divider styling
  - `navbar-avatar` — Circular avatar with hover opacity effect
  - `navbar-bell` — Bell icon with consistent hover behavior
  - `navbar-bell-dot` — Red dot indicator for unread notifications

- **Profile dropdown** — Now uses `orgEmail` from auth state instead of hardcoded `org@example.com`

### Technical

- **New files:**
  - `frontend/src/context/NotificationContext.tsx`
  - `frontend/src/components/NotificationDropdown.tsx`

- **Updated files:**
  - `frontend/src/hooks/useAuth.ts` — Added `orgEmail` to auth state
  - `frontend/src/components/Navbar.tsx` — New notification bell and avatar dropdown
  - `frontend/src/components/Navbar.css` — New dropdown classes and styles
  - `frontend/src/App.tsx` — Wrapped with `NotificationProvider`
