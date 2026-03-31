# UnionCase

**AI-powered grievance management for USPS postal workers and union stewards.**

[Live App](https://app.unioncase.org) | [API Docs](./API_DOCUMENTATION.md) | [Setup Guide](./SETUP_GUIDE.md)

---

## The Problem

Every year, tens of thousands of USPS postal workers file workplace grievances through their unions — for contract violations like forced overtime, out-of-schedule assignments, safety issues, and seniority disputes. The grievance process is adversarial, deadline-driven, and documentation-heavy. Miss a filing window by one day, and the case is dead.

Despite this, most union stewards manage their caseloads with paper folders, personal spreadsheets, and text messages. There is no standard tooling. The result:

- **Missed deadlines** — Each grievance step has contractual time limits (often 14 days). Stewards juggling 20+ active cases lose track.
- **Lost documentation** — Evidence photos, witness statements, and management responses live in stewards' personal phones and email inboxes. When a steward transfers, institutional knowledge walks out the door.
- **No visibility** — Grievants (the workers who filed) have no way to check case status without calling their steward. Representatives at the district level can't see patterns across facilities.
- **Inconsistent filings** — New stewards don't know which contract articles apply to which violations, leading to weaker cases.

UnionCase replaces the paper-and-spreadsheet workflow with a purpose-built PWA that understands the USPS grievance process — its steps, deadlines, contract articles, and union-specific rules.

## Why This Matters

The USPS employs over 600,000 workers across NALC (city carriers), NRLCA (rural carriers), and APWU (clerks, maintenance, MVS operators). Each union has its own collective bargaining agreement with different grievance steps, time limits, and terminology. A tool that doesn't account for these differences is useless in practice.

Union grievance rights exist to enforce the contract — the only protection workers have against management overreach. When grievances are mishandled due to disorganization, workers lose cases they should have won. UnionCase exists to make sure the process itself never becomes the reason a worker loses their case.

---

## Features

### Dashboard & Case Management
The main dashboard provides a filterable, searchable case list with real-time statistics. Desktop users see a data table with sortable columns (case number, grievant, violation type, current step, status, days active). Mobile users see compact cards optimized for one-handed use. Multi-select allows batch PDF export of case files. Pull-to-refresh is implemented for mobile users who expect native app behavior.

### Grievance Filing with Template System
The new case form captures every field needed for a formal grievance: grievant info, incident date/time, contract article, violation type, detailed description, witnesses, management representative, and steward assignment. Pre-built case templates (10 included for NALC and NRLCA) auto-populate contract articles and description frameworks for common violations like overtime, out-of-schedule, and safety issues. This reduces filing time and helps new stewards build stronger cases.

### Multi-Step Process Tracking
Each grievance progresses through union-specific steps: Draft, Filed, Informal Step A, Formal Step A, Step B, Arbitration, and resolution states (Resolved, Settled, Denied, Withdrawn). The app enforces valid step transitions and logs every change to an immutable timeline with timestamps and handler attribution.

### AI Case Assistant
A context-aware chatbot powered by OpenAI GPT-4o-mini helps stewards with contract questions, procedural guidance, and case strategy. The assistant is loaded with the full USPS contract reference and dynamically injected with the user's active cases, upcoming deadlines, and union-specific rules. It cites contract articles, flags urgent deadlines, and suggests next steps. Every response includes a legal disclaimer — this is guidance, not legal advice.

### Deadline Tracking & Automated Reminders
Contractual deadlines are calculated per grievance step and tracked in a dedicated table. A daily cron job (8 AM UTC via Vercel) checks all active deadlines and sends email reminders at user-configurable intervals (default: 3 days, 1 day, and same-day). Overdue deadlines trigger separate alerts. Notifications are deduplicated per user per day using a unique composite index.

### Document Management
Supports uploading photos, PDFs, Word docs, and text files (up to 10MB) to any grievance. Files are stored in Vercel Blob (cloud object storage) with metadata tracked in PostgreSQL. Images are compressed client-side before upload using `browser-image-compression`. Documents are labeled and described for easy retrieval during hearings.

### PDF Case Export
Generates complete grievance reports using PDFKit — includes case details, full timeline, all deadlines with completion status, and notes. Designed to produce a print-ready case file that stewards can bring to Step B hearings or arbitration.

### Steward Workload Dashboard
A dedicated view for stewards and representatives showing: urgent deadlines (next 7 days), overdue deadlines, stale cases (no activity in 30+ days), distribution by grievance step and violation type, and a recent activity feed. This is the "air traffic control" view that prevents cases from falling through the cracks.

### Information Request Tracking
Tracks NLRA Section 8(a)(5) information requests — formal document demands that management is legally required to fulfill. Each request has a status lifecycle (sent, received, partial, refused, overdue) so stewards can prove they followed proper procedure.

### Case Collaboration
Multiple stewards or representatives can be added to a case with role-based permissions (viewer, editor, lead). This supports the real-world workflow where a shop steward starts a case and a chief steward or union representative takes over at higher steps.

### Calendar Integration
Generates a standard iCal (.ics) feed of all upcoming deadlines that users can subscribe to in Google Calendar, Outlook, or Apple Calendar. Deadlines appear alongside personal events without any manual entry.

### Push Notifications & Email Alerts
Browser push notifications via the Web Push API for real-time deadline alerts. Email notifications (via Nodemailer/SMTP) for new grievances, deadline reminders, status updates, note additions, and case resolutions. All notification types are individually toggleable per user.

### Trial & Subscription System
New users get a 30-day free trial with full access. The system tracks trial start/end dates, sends warning emails at 7 days and 2 days before expiration, and automatically expires access. Subscription middleware gates all protected routes.

### Union-Specific Configuration
The app is not generic — it understands the differences between NALC, NRLCA, and APWU contracts. Craft selection auto-maps to the correct union. Grievance steps, time limits, terminology (e.g., "Branch" vs. "Local"), and available templates all adapt based on the user's union affiliation.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite 7 | Fast HMR in development, optimized builds in production. React 19 for concurrent features and improved performance. |
| **Styling** | Tailwind CSS 3 | Utility-first approach enables rapid iteration on a mobile-first UI without fighting CSS specificity. Custom theme tokens match USPS/union branding. |
| **Routing** | React Router 7 | Standard React routing with protected route wrappers and role-based navigation. |
| **HTTP Client** | Axios | Request/response interceptors handle JWT injection and 401/403 redirects globally. |
| **Icons** | Lucide React | Tree-shakeable icon set — only ships icons actually used. |
| **Dates** | date-fns | Modular date library — import only the functions needed, unlike Moment.js. |
| **PWA** | vite-plugin-pwa + Workbox | Auto-generates service worker with configurable caching strategies. NetworkFirst for API calls (fresh data preferred, cached fallback), CacheFirst for static assets. |
| **Backend** | Node.js + Express 5 | Express 5 for native async error handling. ES Modules throughout. |
| **Database** | PostgreSQL 14+ | Relational model fits the structured, relationship-heavy grievance domain. JSONB for flexible notification preferences. GIN index on JSONB for query performance. |
| **Auth** | JWT + bcryptjs | Stateless auth suits the serverless deployment model — no session store needed. 7-day token expiry balances security and UX for users who open the app weekly. |
| **File Storage** | Vercel Blob | Serverless-compatible cloud object storage. Avoids the ephemeral filesystem problem on Vercel Functions. |
| **AI** | OpenAI GPT-4o-mini | Cost-effective model for contract Q&A. Context window is large enough to include the full contract reference + user's active cases. |
| **Email** | Nodemailer | Battle-tested SMTP client. HTML email templates with USPS-styled branding. |
| **PDF** | PDFKit | Server-side PDF generation without browser dependencies. Works in serverless functions. |
| **Scheduling** | Vercel Cron + node-cron | Vercel Cron for production (daily deadline/trial checks). node-cron for local development (5-10 minute intervals for testing). |
| **Validation** | express-validator | Declarative input validation on all mutation endpoints. |
| **Rate Limiting** | express-rate-limit + DB-backed chat limits | IP-based rate limiting for API endpoints. Database-backed rate limiting for AI chat survives serverless cold starts (in-memory counters reset on each invocation). |
| **Hosting** | Vercel (frontend + API) | Git-push deployment, edge network, serverless functions, built-in cron. Single platform for the entire stack. |
| **Database Hosting** | Vercel Postgres / Railway | Managed PostgreSQL with connection pooling compatible with serverless. |

---

## Architecture

```
                          ┌─────────────────────────────────┐
                          │         Vercel Edge Network      │
                          │   (CDN, SSL, Security Headers)   │
                          └──────────┬──────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
              │  Static   │  │   Vercel    │  │   Vercel   │
              │  Assets   │  │  Functions  │  │    Cron    │
              │ (React    │  │  (Express   │  │  (Daily    │
              │  SPA)     │  │   API)      │  │  Jobs)     │
              └───────────┘  └──────┬──────┘  └─────┬──────┘
                                    │               │
                          ┌─────────▼───────────────▼──┐
                          │       PostgreSQL            │
                          │   (Vercel Postgres /        │
                          │    Railway)                  │
                          └─────────────────────────────┘
                                    │
                          ┌─────────▼───────────┐
                          │    Vercel Blob      │
                          │  (File Storage)     │
                          └─────────────────────┘
```

**The frontend** is a React SPA built by Vite and served as static files from Vercel's CDN. Client-side routing handles all navigation; the catch-all rewrite in `vercel.json` ensures deep links work.

**The API** is a single Express app exported as a Vercel serverless function (`api/index.js`). All `/api/*` requests route to this function. Connection pooling is configured for serverless: max 1 connection per invocation, 10-second idle timeout, 5-second connection timeout.

**Cron jobs** are separate serverless functions (`api/cron/check-deadlines.js`, `api/cron/check-trials.js`) triggered on schedule by Vercel. They're secured with a `CRON_SECRET` bearer token to prevent unauthorized invocation.

---

## Database Schema

The data model is designed around the real-world grievance lifecycle:

```
users ──────────┐
  │              │
  │ files        │ assigned to
  ▼              ▼
grievances ◄── grievance_collaborators
  │
  ├──► grievance_timeline    (immutable event log)
  ├──► deadlines             (contractual time limits)
  ├──► documents             (evidence files)
  ├──► notes                 (internal/external case notes)
  ├──► notifications         (user alerts)
  └──► information_requests  (NLRA 8(a)(5) demands)

audit_trail                  (system-wide immutable action log)
case_templates               (pre-built filing templates)
push_subscriptions           (web push endpoints)
chat_rate_limits             (DB-backed rate limiting)
```

**Key data model decisions:**

- **`grievance_number` is a unique business key** separate from the auto-increment `id`. Grievance numbers follow union conventions and are what stewards reference in hearings.
- **`current_step` uses CHECK constraints** to enforce valid values at the database level, not just in application code. Invalid state transitions are caught even if the API has a bug.
- **`witnesses` is a `text[]` array** — PostgreSQL native arrays avoid a join table for what is always fetched with the parent record.
- **`notification_preferences` is JSONB** with a GIN index. Preferences are semi-structured and queried during batch notification runs. JSONB avoids schema migrations when adding new preference types.
- **`audit_trail` is append-only** — no UPDATE or DELETE operations. The `details` column is JSONB to capture arbitrary context per action type.
- **Cascade deletes** propagate from `grievances` to all child tables. When a case is deleted, all associated data is cleaned up automatically.
- **Deduplication index on notifications** (`unique_notification_per_day`) prevents the daily cron from sending duplicate reminders if it runs multiple times.

---

## Authentication & Security

### Authentication Flow
1. **Registration** — Password hashed with bcryptjs (10 salt rounds). Union type auto-determined from craft selection. JWT issued immediately.
2. **Login** — Email/password validated. Trial expiration checked on every login. JWT returned with 7-day expiry.
3. **Protected routes** — `authenticate` middleware extracts and verifies JWT from `Authorization: Bearer` header. `authorize(...roles)` middleware enforces role-based access.
4. **Subscription gating** — `requireActiveSubscription` middleware blocks expired/cancelled users from all protected endpoints with a 403 and contact information.

### Security Measures
- **Input validation** on all mutation endpoints via express-validator
- **Parameterized SQL queries** — all database queries use `$1, $2` placeholders, never string interpolation
- **Rate limiting** — 100 requests/15min per IP (general), 5 requests/15min (auth), 20 messages/15min per user (AI chat, DB-backed)
- **File upload restrictions** — whitelist of allowed MIME types, 10MB size limit, multer handling
- **Security headers** via Vercel — HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, restrictive Permissions-Policy
- **CORS** — credentials enabled, origin restricted to configured client URL
- **SSL/TLS** enforced in production database connections

### Access Control Model
| Role | Own Cases | Assigned Cases | All Cases |
|------|-----------|---------------|-----------|
| Employee | Full access | - | - |
| Steward | Full access | Full access | - |
| Representative | Full access | Full access | Read access |

Collaboration extends this model — any user added as a collaborator gains access to that specific case at their assigned permission level (viewer, editor, or lead).

---

## Technical Decisions

### Why a PWA instead of a native app?

The target users are USPS postal workers — they're on mail routes all day using personal phones. A PWA provides:
- **Install from browser** — no App Store approval process, no waiting for review cycles
- **Works on any device** — iOS, Android, desktop, without maintaining separate codebases
- **Offline capability** — Workbox caches API responses with NetworkFirst strategy (5-second timeout), so recently viewed cases load even without signal
- **Push notifications** — Web Push API provides native-feeling alerts without native code
- **Automatic updates** — Service worker auto-updates on navigation, no manual app store updates

The tradeoff is limited iOS push notification support (added in iOS 16.4+) and no access to some native APIs. For a form-heavy case management tool, this tradeoff is acceptable.

### Why PostgreSQL over a document database?

Grievance data is inherently relational: a case has deadlines, a timeline, documents, notes, and collaborators. These relationships need referential integrity — a deadline should never reference a deleted grievance. PostgreSQL provides:
- Foreign keys with CASCADE for automatic cleanup
- CHECK constraints for valid state enforcement at the DB level
- JSONB for the parts that genuinely benefit from flexibility (notification preferences)
- Native array types for simple lists (witnesses) that don't need their own table
- GIN indexes for JSONB query performance

A document database would require application-level enforcement of relationships that PostgreSQL handles for free.

### Why serverless on Vercel instead of a persistent server?

The app has low, bursty traffic — stewards file cases during work hours, then nothing overnight. A persistent server would idle 16+ hours/day. Vercel serverless functions:
- Scale to zero when unused (cost efficiency)
- Scale up automatically during peak usage
- Eliminate server maintenance, OS patching, process management

The main challenge is database connections — each serverless invocation creates a new connection. This is solved with aggressive pool settings (max 1 connection, short timeouts) and Vercel Postgres's built-in connection pooling.

The other challenge is in-memory state — standard rate limiting libraries reset on cold starts. The AI chat rate limiter uses a `chat_rate_limits` table in PostgreSQL instead of in-memory counters, so limits persist across invocations.

### Why database-backed rate limiting for the AI chat?

In-memory rate limiters (like express-rate-limit) work fine for general API protection because the window is short (15 minutes) and the limit is generous (100 requests). But the AI chat has a tight limit (20 messages/15 minutes) and costs real money per request (OpenAI API). A serverless cold start resetting the counter would let users bypass the limit by waiting for the function to spin down. The database approach guarantees the limit holds regardless of infrastructure behavior.

### Why GPT-4o-mini instead of GPT-4o?

The AI assistant answers contract questions and provides procedural guidance — tasks that don't require the reasoning depth of GPT-4o. GPT-4o-mini is:
- ~20x cheaper per token
- Faster response times (better UX for chat)
- Sufficient for retrieval-augmented Q&A against the loaded contract reference
- Max output capped at 800 tokens to keep responses concise and costs controlled

### Why Express 5?

Express 5 supports native async/await error handling — rejected promises automatically propagate to the error handler without wrapping every route in try/catch. For a codebase with async database queries in every route, this eliminates an entire class of unhandled promise rejection bugs.

---

## Target User & UX Design

### Who uses this

**Primary: Union stewards** — Postal workers elected by their peers to represent them in grievances. They are not lawyers or tech professionals. They manage 10-50 active cases while also working their own mail routes. They need to file cases quickly between deliveries, check deadlines before meetings with management, and pull up case details during hearings.

**Secondary: Grievants (employees)** — Workers who filed a grievance and want to track its progress without calling their steward every week.

**Tertiary: Union representatives** — Full-time union officials who oversee multiple facilities and need visibility across all cases in their jurisdiction.

### UX decisions driven by these users

**Mobile-first layout** — Stewards are on mail routes, not at desks. The entire app is designed for phone use first. Touch targets are 44px minimum. The bottom navigation bar is positioned for thumb reach. A floating action button provides one-tap access to file a new case.

**Pull-to-refresh** — Stewards expect the same interaction patterns as their other apps. The dashboard implements a custom pull-to-refresh with damped physics for a native feel.

**iOS and Android install prompts** — Custom install modals with platform-specific instructions. iOS requires Safari's "Add to Home Screen" flow, which is non-obvious. The app detects iOS and shows step-by-step visual instructions. A visit counter delays the prompt until the 2nd or 3rd visit to avoid annoying first-time users.

**Offline-first caching** — Stewards in USPS facilities often have poor cell signal. Workbox caches API responses so recently viewed cases load instantly from cache, falling back to network. The 5-second network timeout prevents the UI from hanging on slow connections.

**Template system** — New stewards don't know which contract article applies to an overtime violation vs. a safety issue. Templates pre-populate the correct article, violation type, and description framework. This lowers the skill barrier and produces more consistent filings.

**AI assistant positioned as helper, not replacement** — The chatbot is a floating widget, not the main interface. It answers questions in context (aware of the user's cases and deadlines) but never makes decisions. Every response carries a "not legal advice" disclaimer. This respects the steward's judgment while giving them a reference tool.

**Role-based navigation** — Employees see a simple dashboard focused on their own cases. Stewards see their caseload plus a workload dashboard. Representatives see everything. The UI doesn't overwhelm users with features they don't need.

**Notification preferences are granular** — Users can enable/disable each notification type independently and choose which reminder intervals they want (3 days, 1 day, same day). Postal workers already get too many notifications from USPS apps — this app respects their attention.

---

## Deployment

The production app at [app.unioncase.org](https://app.unioncase.org) runs on:

- **Vercel** — Frontend static hosting, serverless API functions, cron jobs, blob storage
- **Vercel Postgres / Railway** — Managed PostgreSQL with SSL

Deployment is automated via git push to `main`. Vercel builds the React client, bundles the Express API as serverless functions, and deploys to its edge network.

**Cron jobs** run daily:
- `0 8 * * *` — Check deadlines and send reminders
- `0 9 * * *` — Check trial expirations and send warnings

**Estimated production cost:** ~$20-25/month (Vercel Pro + managed PostgreSQL).

---

## Challenges & Solutions

### Serverless connection pooling
**Problem:** Each Vercel function invocation opens a new database connection. Under load, this exhausts PostgreSQL's connection limit.
**Solution:** Pool configured with `max: 1` connection per invocation, 10-second idle timeout, and 5-second connection timeout. Vercel Postgres provides server-side connection pooling (PgBouncer) to multiplex these short-lived connections.

### Rate limiting in stateless functions
**Problem:** In-memory rate limiters reset on cold starts, making them ineffective for the AI chat cost control.
**Solution:** `chat_rate_limits` table in PostgreSQL stores per-user message counts with sliding windows. The rate check is a single SQL query — no in-memory state required.

### Notification deduplication
**Problem:** The deadline cron could run multiple times (retries, overlapping invocations) and send duplicate reminders.
**Solution:** A unique composite index on `(user_id, notification_type, grievance_id, created_at::date)` causes duplicate inserts to fail silently. The notification is only created once per user per day per grievance.

### Multi-union support
**Problem:** NALC, NRLCA, and APWU have different grievance steps, time limits, and terminology. A one-size-fits-all approach would confuse users.
**Solution:** `unionConfig.js` (shared between client and server) maps each union to its specific steps, deadlines, craft types, and labels. The user's craft selection at registration auto-determines their union, and all downstream behavior adapts.

### iOS PWA install experience
**Problem:** iOS doesn't support the standard `beforeinstallprompt` event. Users have to know about Safari's "Add to Home Screen" option.
**Solution:** A custom `IOSInstallModal` component detects iOS Safari and shows visual step-by-step instructions. It appears after 2-3 visits (not immediately) and can be permanently dismissed.

---

## What I'd Do Differently / What's Next

### If starting over
- **TypeScript from day one** — The codebase is JavaScript throughout. TypeScript would catch data shape mismatches between the API and frontend that currently rely on runtime errors to surface.
- **tRPC or similar** — End-to-end type safety between client and server would eliminate an entire class of integration bugs and make refactoring safer.
- **React Query / TanStack Query** — The current approach uses raw Axios calls with local state. A data-fetching library would provide caching, deduplication, optimistic updates, and background refresh for free.

### What's next
- **Stripe integration** — The trial system is built; payment processing is the missing piece for sustainability. Schema and flow are designed (see `SUBSCRIPTION_IMPLEMENTATION.md`).
- **Offline-first with background sync** — Currently, the app caches reads but can't queue writes offline. Adding IndexedDB + Workbox background sync would let stewards file cases with no signal and sync when connectivity returns.
- **Real-time collaboration** — WebSocket-based updates so multiple stewards on a case see changes live instead of refreshing.
- **Analytics and pattern detection** — Aggregate data across facilities to identify systemic contract violations. If 15 carriers at the same station all file overtime grievances in the same month, that's a pattern the union should escalate.
- **Native push on iOS** — With iOS 16.4+ supporting web push, implement the full notification permission flow for iOS PWA users.
- **E2E test suite** — Playwright or Cypress tests covering the critical path: registration, case filing, step progression, deadline notification.

---

## Project Structure

```
├── api/                          # Vercel serverless function entry points
│   ├── index.js                  #   Express app adapter
│   └── cron/                     #   Scheduled jobs (deadlines, trials)
│
├── client/                       # React frontend (Vite)
│   ├── src/
│   │   ├── components/           #   19 reusable UI components
│   │   ├── contexts/             #   AuthContext (global auth state)
│   │   ├── pages/                #   9 page components
│   │   ├── services/             #   Axios API client
│   │   ├── utils/                #   Union config, formatting, validation
│   │   ├── App.jsx               #   Router and layout
│   │   └── registerServiceWorker.js
│   ├── vite.config.js            #   Build config + PWA plugin
│   └── tailwind.config.js        #   Custom theme
│
├── server/                       # Express.js backend
│   ├── src/
│   │   ├── config/               #   Database schema, migrations, seeds
│   │   ├── controllers/          #   Route handlers
│   │   ├── middleware/           #   Auth, subscription, audit trail
│   │   ├── routes/               #   API route definitions
│   │   ├── services/             #   AI chat, email, notifications, PDF
│   │   ├── utils/                #   Union config, helpers
│   │   └── app.js                #   Express app setup
│   └── package.json
│
├── vercel.json                   # Deployment config, cron, headers
├── CONTRACT_REFERENCE.md         # USPS contract articles (loaded by AI)
└── package.json                  # Root dependencies
```

## Local Development

```bash
# Prerequisites: Node.js 18+, PostgreSQL 14+

# 1. Clone and install
git clone https://github.com/samcraw1/unioncase-grievance-tracker.git
cd unioncase-grievance-tracker
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 2. Set up the database
createdb usps_grievance_tracker
psql -U postgres -d usps_grievance_tracker -f server/src/config/schema.sql

# 3. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials, JWT secret, and OpenAI key

# 4. Start development servers
cd server && npm run dev    # API on :5001
cd client && npm run dev    # Frontend on :5173 (proxies /api to :5001)
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions and [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for contribution guidelines.

## License

MIT
