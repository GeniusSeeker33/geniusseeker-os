# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working with this repo.

## What this repo is

**GeniusSeeker OS** — a React/Vite single-page dashboard backed by Supabase. It unifies applicant intake (from join-orion.com), recruiting pipeline management, referral attribution, payout tracking, candidate activity, and a contribution leaderboard.

The repo was cloned from the older `geniusseeker-build` static site and still contains legacy files from that pivot — see "Legacy files" below. **Default to working on the React SPA unless explicitly asked about a legacy page.**

## Working directory

All commands run from:

```
/workspaces/geniusseeker-os/app
```

Not the parent `/workspaces/geniusseeker-os` — there is no `package.json` there.

## Commands

```bash
npm run dev      # Vite dev server (HMR, default port 5173)
npm run build    # Vite production build → dist/
npm run preview  # Preview the built dist/ on port 5173
```

## Environment

`.env.local` (gitignored) requires:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The OS app reads/writes the **existing Join-Orion Supabase project** — there is no OS-specific Supabase instance.

## Architecture

### Entry point

- `index.html` → `src/main.jsx` → `src/App.jsx`
- `App.jsx` defines a `react-router-dom` BrowserRouter with all routes nested under `MainLayout`.
- `MainLayout.jsx` is the sidebar + main-content shell. The sidebar nav list lives there.

### Routes and pages (`src/pages/`)

| Route          | Page              | Status                                  |
| -------------- | ----------------- | --------------------------------------- |
| `/`            | `Dashboard.jsx`   | Live (totals, recent activity, top referrers) |
| `/recruiting`  | `Recruiting.jsx`  | Live (ATS table + kanban + drawer + activity log) |
| `/referrals`   | `Referrals.jsx`   | Live (referral wallet)                  |
| `/leaderboard` | `Leaderboard.jsx` | Live (contribution ranking)             |
| `/simulator`   | `Simulator.jsx`   | Stub — Sales Simulator integration TBD  |
| `/crm`         | `CRM.jsx`         | Stub                                    |
| `/missions`    | `Missions.jsx`    | Stub — Ambassador / Marketing Missions  |
| `/admin`       | `Admin.jsx`       | Stub                                    |

### Supabase

- Client created in `src/lib/supabase.js` (exports `supabase`).
- Tables used:
  - `candidate_applications` — primary applicant table (from Join-Orion). OS-added columns: `source`, `notes`, `recruiter`, `referred_by`, `referral_payout_amount`, `referral_payout_status`. Existing column `resume_path` points at Supabase Storage but isn't yet wired into the UI.
  - `job_postings` — existing from Join-Orion.
  - `candidate_activity` — OS-owned audit log. Columns: `id`, `candidate_id` (FK with cascade), `activity_type`, `activity_note`, `created_by`, `created_at`.
- Status enum (enforced in app code, not DB): `new, screened, interviewing, offered, hired, rejected`.
- Setting status to `hired` automatically sets `referral_payout_status = 'earned'`.
- Leaderboard scoring (in app code): referral = 10pts, hire = 50pts, every $100 earned payout = 10pts.

### RLS — dev state

Permissive anon SELECT on `candidate_applications` and `candidate_activity`, plus anon INSERT on activity. **This is dev-only and must be locked down before production** (role-based policies once Supabase Auth is wired in).

### Styling

- Global styles in `src/index.css` (custom CSS — not Tailwind classes despite Tailwind being installed).
- `tailwind.config.js` exists from the legacy site; Tailwind is available but the OS pages don't currently rely on it. Match the existing CSS-variable / utility-class style in `index.css` when adding UI.

### Module scaffolding

`src/modules/{admin,crm,dashboard,leaderboard,missions,recruiting,referrals,simulator}/` directories exist but are empty. Reserved for future per-module component splits — page-level code currently lives directly in `src/pages/`.

## Legacy files (not part of the OS dashboard)

The following predate the OS pivot and remain in the repo. **Do not modify them unless explicitly asked**:

- Static HTML pages at the repo root (`candidates.html`, `employers.html`, `jobs.html`, `admin-*.html`, `quiz.html`, etc.).
- `vite.config.js` lists every legacy `.html` page in `rollupOptions.input` alongside the new `index.html` — they still build but aren't part of the SPA.
- `src/Quiz.jsx`, `src/quiz-main.jsx`, `src/quizquestions.js` — the React STEAM quiz used by `quiz.html`.
- `partials/`, `js/`, `css/` — the legacy multi-page site's shared assets.
- `infra/identity-service/` — the original Express/TypeScript backend (Hedera, Deel, Formspree, Resend, etc.). **Not used by the OS dashboard**, which talks to Supabase directly.

## Roadmap (priority order)

1. **Supabase Auth + roles** — admin / recruiter / referrer / candidate / employer. Login page, protected routes, role-aware nav.
2. **Resume viewer** — signed Supabase Storage URL from `resume_path`, "View Resume" button in candidate drawer.
3. **AI candidate scoring** — add `candidate_score`, `ai_summary`, `skills jsonb`, `risk_flags jsonb`.
4. **Activity logging polish** — auto-refresh after logging, editable custom notes, filters, real `created_by` from logged-in user.
5. **Referrals → candidates flow** — "Add Referral" creates a `candidate_applications` row with `source='Referral'`.
6. **Sales Simulator integration** — pull from sibling `sales_simulator_orion` repo.
7. **Ambassador / Marketing Missions** — title, type, assigned_to, proof, check-in, content, approval, reward, points.
8. **Recruiter wallet** — earned/pending payouts, history, leaderboard rank.
9. **Company/client management** — `companies`, multi-tenant via `company_id` on major tables.
10. **Production security** — lock down RLS, require login, role-based policies, admin-only payout actions.

## Watchouts

- Never leave shell heredoc wrappers (`cat > file <<'EOF' … EOF`) inside `.jsx`/`.css` source files — has broken the build before. Use the Write/Edit tools directly, not echoed heredocs.
- `candidate_activity` policies may need `drop policy if exists` added if re-running schema SQL.
- The current dashboard works because of the permissive anon SELECT policy. Any RLS tightening must be paired with Auth work or the live pages will break.
