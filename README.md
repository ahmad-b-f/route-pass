# Route Pass

Day-based transport verification for university bus fleets. Verifies, per trip, whether a
student is entitled to ride *today* based on which weekdays (Mon–Sat) they've paid for —
and blocks students who paid for fewer days than they actually travel.

Three surfaces in one Next.js app:
- **Admin Portal** (`/admin`) — students, buses, routes, analytics, scan log, settings
- **Student PWA** (`/student`) — mobile-first, installable, works offline at boarding time
- **Bus QR** — one static, printed QR per bus, generated from the Admin Portal

## 1. Quick start

```bash
npm install
npm run build   # production build (also type-checks everything)
npm run start   # serve the production build on :3000
# or for local development:
npm run dev
```

Run the test suite (pure-logic + signing engine, 18 tests, no network/DB required):

```bash
npm test
```

## 2. Connect Supabase

1. Create a free project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql` from this repo — creates
   `students`, `buses`, `routes`, `scan_logs`, with permissive demo RLS policies.
3. In the app, go to **Admin → Settings** and paste your project URL and **anon (public) key
   only** — never the `service_role` key. Keys are stored in this browser's `localStorage`
   only; nothing is sent anywhere except directly to your own Supabase project.
4. Add at least one route, one bus (this auto-generates that bus's QR-signing secret), and
   one student, then sign in on the Student site with that student's phone + password.

Until Settings is configured, every data page shows a clear "Supabase isn't connected yet"
state instead of crashing — this is intentional, not a bug.

## 3. How verification works

- Each **bus** gets a unique secret when it's created (Admin → Buses). Its QR code encodes
  `{ busId, signature }`, signed with that secret — print/laminate it once, it never changes.
- When a **student signs in**, the app caches their own record *and* their assigned bus's
  row (including its signing secret) in `localStorage`.
- **Boarding**: the student's camera scans the bus's static QR. The app verifies the
  signature locally against the cached secret, then runs `evaluateCheckIn` (see
  `src/lib/verification.ts`) — fee active? today a paid day? already used today? — entirely
  offline. Connectivity is only used to sign in earlier and to best-effort sync the scan log
  afterward; boarding itself never waits on the network.
- A **receipt** is generated locally on every scan (granted or denied), tinted with that
  day's assigned color (Admin → Settings) so a screenshot from a different day looks
  visibly wrong at a glance.

## 4. Project structure

```
src/app/admin/…        Admin Portal pages (dashboard, students, buses, routes, logs, settings)
src/app/student/…      Student PWA pages (login, pass + scanner, receipts)
src/components/icons/  Custom hand-drawn SVG icon set (no emoji, no icon font)
src/components/ui/     Shared Button/Input/Panel/Pill primitives
src/lib/types.ts        Domain types (Student, Bus, Route, ScanLog, …)
src/lib/verification.ts HMAC signing + the pure evaluateCheckIn decision engine
src/lib/db.ts            Supabase CRUD wrappers for every entity
src/lib/session.ts       Student-side offline cache (own record, assigned bus, used-today flags, receipts)
src/lib/config.ts        Admin-entered Supabase keys, stored in localStorage
supabase/schema.sql      Full table schema + RLS policies
tests/                   Vitest suite for the decision engine and signing primitives
public/manifest.json     PWA manifest
public/sw.js             Service worker (offline app-shell caching)
```

## 5. Test coverage

`tests/verification.test.ts` — the check-in decision matrix:
- granted: valid signature + fee active + today is a paid day + not yet used
- denied: invalid/tampered signature
- denied: fee suspended (even on a correctly paid day)
- denied: today isn't a paid day
- denied: already checked in today
- Saturday is a valid, assignable travel day
- Sunday is never a travel day
- a 3-day-plan student is denied on all other travel days (the core problem this app solves)
- deterministic reason ordering when multiple checks fail at once

`tests/signing.test.ts` — the HMAC engine:
- valid signature round-trips
- wrong secret fails
- tampered payload fails
- garbage/non-JSON input fails closed instead of throwing
- a bus's own QR verifies repeatedly (it's static by design — `alreadyUsedToday` is what
  blocks repeat boarding, not the signature)
- day-pass token round-trip and secret-rotation failure case

Run with `npm test`. All 18 pass as of this build.

**What isn't covered by automated tests**: end-to-end CRUD against a live Supabase project,
and the camera-scanning flow itself (both require a real backend / a camera, neither of
which exist in a CI sandbox). Both were manually verified against a running build: every
route returns `200`, the app renders correctly with zero data, and all admin/student pages
fail gracefully (clear inline message, no crash) before Supabase is configured.

## 6. Known limitations (read before a real pilot)

This is a working, pilot-ready build — but a few things are deliberately simplified and
should be hardened before trusting it with real fee money:

- **Password hashing is client-side SHA-256**, not a salted algorithm like bcrypt/argon2.
  Move authentication into a server route or Supabase Edge Function for a real deployment.
- **No single-session enforcement.** Sharing a password still lets two people appear
  "logged in" at once — the day-color + already-used-today checks catch most abuse in
  practice, but this isn't the same as revoking a stolen credential.
- **RLS policies in `schema.sql` are permissive by design** (anyone with your anon key can
  read/write) so the app works immediately after connecting. Tighten them once you move
  login server-side and can scope rows to an authenticated identity.
- **Per-bus QR secrets are cached client-side** after a student's first login. This is fine
  for a single-campus pilot; a determined attacker with access to a student's device storage
  could extract that bus's secret. A future iteration should rotate secrets periodically or
  move verification server-side via a lightweight edge function.

## 7. Day-color & receipt customization

Admin → Settings → Day colors lets you set (or auto-generate) a distinct color per weekday.
This color is used as the background of both the boarding-time verify/deny screen and the
receipt saved in the student's "My receipts" history — the whole point being that a
screenshot from a previous day is visually, immediately wrong.
