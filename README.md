# DNH Backend

Production backend for DNH — a funding platform connecting **Investors**, **Companies**, and **Associate Partners** (platform operators who verify companies/documents and manage the marketplace).

Stack: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase), Supabase Storage, JWT auth, Zod validation, bcryptjs, Helmet, rate limiting.

## Architecture

```
src/
  config/         env, prisma client, supabase client
  constants/      roles, error codes, storage buckets
  errors/         AppError class
  types/          express.d.ts (req.account augmentation)
  utils/          jwt, hashing, otp generation, response helpers, asyncHandler
  middleware/     auth, role guard, validation, rate limiting, upload, error handler
  validators/     Zod schemas per module
  repositories/   Prisma data-access layer (one per entity group)
  services/       business logic (auth, company, investor, funding, investment, document, notification, associate)
  controllers/    thin HTTP layer calling services
  routes/         Express routers per module + index
  emails/         email service (OTP, welcome, verification outcomes)
  storage/        Supabase Storage upload/delete/signed-url service
  app.ts          Express app (middleware pipeline)
  server.ts       entry point, DB connect, graceful shutdown
prisma/
  schema.prisma   full data model
```

Layering: **routes → controllers → services → repositories → Prisma**. Controllers never touch Prisma directly; services own business rules and authorization checks that depend on data.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env`. Fill in:
   - `DATABASE_URL` / `DIRECT_URL` — from Supabase Project Settings → Database (use the pooled connection string for `DATABASE_URL`, direct connection for `DIRECT_URL`)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` — Project Settings → API
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`
   - `SMTP_*` — any SMTP provider (Gmail app password, SendGrid, Resend SMTP, etc). If left blank, OTP emails are logged to console instead of sent — useful for local dev.
3. `npx prisma migrate dev --name init` — creates all tables in your Supabase Postgres.
4. `npx prisma generate` — generates the typed Prisma client (this couldn't be run in the sandbox that built this scaffold due to network restrictions, but works normally with internet access).
5. Create Supabase Storage buckets (Dashboard → Storage → New bucket), all **public**:
   - `company-documents`
   - `investor-documents`
   - `avatars`
   - `logos`
   - `kyc`
   - `pitch-decks`
6. `npm run dev` — starts on `http://localhost:5000`.

### Creating your first Associate Partner

There's no public signup for Associate Partners (by design — it's an internal ops role). Create one directly:

```sql
-- after registering a normal account via API, or insert directly:
insert into "Account" (id, email, "passwordHash", role, status, "isEmailVerified")
values (gen_random_uuid(), 'ops@dnh.com', '<bcrypt_hash>', 'ASSOCIATE_PARTNER', 'ACTIVE', true);
```
Simpler: temporarily add a `POST /api/auth/register/associate` route calling `accountRepository.createAssociatePartner`, hit it once, then remove it — or just insert via Prisma Studio (`npx prisma studio`) using a bcryptjs hash generated via a one-off script.

## Auth flow

1. `POST /api/auth/register/investor` or `/register/company` → creates account (status `PENDING_VERIFICATION`) → sends 6-digit OTP by email.
2. `POST /api/auth/verify-email` with `{email, otp}` → activates account.
3. `POST /api/auth/login` → returns `accessToken` (15 min) + `refreshToken` (7 days, also set as httpOnly cookie scoped to `/api/auth`).
4. Every protected request: `Authorization: Bearer <accessToken>`.
5. On 401 with `TOKEN_EXPIRED`: `POST /api/auth/refresh` with `{refreshToken}` (or rely on the cookie) → new `accessToken`.
6. `POST /api/auth/logout` revokes the refresh token.

Password reset: `forgot-password` (sends OTP) → `reset-password` with `{email, otp, newPassword}`.

## Response format

Success:
```json
{ "success": true, "message": "...", "data": { } }
```
Error:
```json
{ "success": false, "message": "...", "errorCode": "VALIDATION_ERROR" }
```

## Full API Reference

### Auth — `/api/auth` (public)
| Method | Route | Body |
|---|---|---|
| POST | `/register/investor` | email, password, fullName, phone?, address? |
| POST | `/register/company` | email, password, companyName, phone?, address? |
| POST | `/verify-email` | email, otp |
| POST | `/resend-otp` | email |
| POST | `/login` | email, password |
| POST | `/refresh` | refreshToken (or cookie) |
| POST | `/forgot-password` | email |
| POST | `/reset-password` | email, otp, newPassword |
| POST | `/logout` | refreshToken (or cookie) |

### Company — `/api/company` (role: COMPANY)
| Method | Route | Body |
|---|---|---|
| GET | `/me` | — |
| PUT | `/profile` | companyName, registrationNumber, industry, description, website, foundedYear, teamSize, address |
| POST | `/logo` | multipart `file` |
| POST | `/submit-verification` | — moves profile to PENDING for associate review |

### Investor — `/api/investor` (role: INVESTOR)
| Method | Route | Body / Query |
|---|---|---|
| GET | `/me` | — |
| PUT | `/profile` | fullName, address, investmentRangeMin/Max, preferredIndustries[], bio |
| POST | `/avatar` | multipart `file` |
| GET | `/companies?industry=&minFund=&maxFund=&page=&limit=` | browse verified companies with active funding |
| GET | `/companies/:id` | full company detail |

### Funding — `/api/funding`
| Method | Route | Role | Body |
|---|---|---|---|
| POST | `/` | COMPANY | title, description, fundNeeded, fundPurpose, valuation?, minimumTicket?, equityOfferedPct? |
| GET | `/` | COMPANY | own opportunities |
| PUT | `/:id` | COMPANY | any updatable field |
| DELETE | `/:id` | COMPANY | — |
| GET | `/active?page=&limit=` | any authenticated | publicly active opportunities |
| GET | `/:id` | any authenticated | single opportunity |

New opportunities start as `PENDING_APPROVAL` and only become visible to investors once an Associate Partner approves them.

### Investments — `/api/investments`
| Method | Route | Role | Body |
|---|---|---|---|
| POST | `/proposals` | INVESTOR | fundingOpportunityId, proposedAmount, message? |
| GET | `/proposals/mine` | INVESTOR | — |
| GET | `/investments/mine` | INVESTOR | — |
| GET | `/proposals/received` | COMPANY | — |
| PUT | `/proposals/:id/respond` | COMPANY | status: ACCEPTED\|REJECTED |
| GET | `/investments/received` | COMPANY | — |

Accepting a proposal auto-creates a confirmed `Investment` record.

### Documents — `/api/documents` (any authenticated role for upload/list/delete)
| Method | Route | Role | Body |
|---|---|---|---|
| POST | `/` | any | multipart `file`, field `type`: KYC\|PITCH_DECK\|COMPANY_REGISTRATION\|FINANCIAL_STATEMENT\|LOGO\|AVATAR\|OTHER |
| GET | `/mine` | any | — |
| DELETE | `/:id` | any (owner only) | — |
| GET | `/pending` | ASSOCIATE_PARTNER | — |
| PUT | `/:id/review` | ASSOCIATE_PARTNER | status: VERIFIED\|REJECTED, rejectionReason? |

### Notifications — `/api/notifications` (any authenticated)
| Method | Route |
|---|---|
| GET | `/?unreadOnly=true` |
| PUT | `/:id/read` |
| PUT | `/read-all` |

### Associate Partner — `/api/associate` (role: ASSOCIATE_PARTNER)
| Method | Route | Body |
|---|---|---|
| GET | `/companies/pending` | — |
| PUT | `/companies/:id/approve` | — |
| PUT | `/companies/:id/reject` | reason |
| GET | `/funding/pending` | — |
| PUT | `/funding/:id/approve` | — |
| PUT | `/funding/:id/reject` | rejectionReason |
| GET | `/documents/pending` | — |
| GET | `/users?role=` | — |
| PUT | `/users/:id/suspend` | — |
| PUT | `/users/:id/reactivate` | — |
| GET | `/analytics` | platform-wide counts + total investment volume |

### Dashboards — `/api/dashboard` (aggregate views, one call per role)
| Method | Route | Role |
|---|---|---|
| GET | `/company` | COMPANY — profile + funding + proposals + investments + documents + unread notifications |
| GET | `/investor` | INVESTOR — profile + proposals + investments + documents + unread notifications |
| GET | `/associate` | ASSOCIATE_PARTNER — pending companies/funding/documents + analytics |

## Security notes

- Passwords hashed with bcryptjs (12 rounds).
- Access tokens are short-lived (15 min); refresh tokens are hashed before storage (never stored in plaintext) and revocable individually or all-at-once (e.g. on password reset).
- Helmet, CORS locked to `FRONTEND_URL`, global + auth-specific + OTP-specific rate limiting.
- All input validated with Zod before hitting controllers.
- File uploads restricted by MIME type and 15MB size cap; stored in Supabase Storage, never on local disk.
- `forgot-password` never reveals whether an email exists.
- Central error middleware normalizes Zod errors, Prisma errors (unique constraint, not found), and `AppError` into the standard response shape — nothing leaks stack traces to clients.

## What you still need to decide / wire up

- **Associate Partner signup path** — intentionally not public; see note above.
- **Payment/escrow rails** — this schema tracks investment *records* (who committed what, to what), not actual money movement. Wiring a payment processor (Razorpay/Stripe Connect/escrow) is a separate integration.
- **SMTP provider** — pick one and drop in credentials; OTP/email logic is already wired.
- **Frontend origin** — set `FRONTEND_URL` correctly for CORS + cookie scoping to work.
