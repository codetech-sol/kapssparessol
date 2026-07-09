# KAPS Auto Spares — Local Setup, Supabase Migration & Deployment Walkthrough

This guide covers understanding the exported Lovable project, running it locally, migrating the PostgreSQL backup to a new Supabase project, and deploying to Vercel.

---

## 1. Project Understanding

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | **TanStack Start** (full-stack React with SSR) |
| Build tool | **Vite 8** |
| UI | **React 19** + **Tailwind CSS v4** |
| Routing | **TanStack Router** (file-based) |
| Data fetching | **TanStack Query** |
| Backend / DB | **Supabase** (`@supabase/supabase-js`) |
| UI components | **shadcn/ui** (Radix UI primitives) |
| Forms / validation | **React Hook Form** + **Zod** |
| AI chat | **Vercel AI SDK** via Lovable AI Gateway |
| Deploy target (default) | **Nitro** → Cloudflare (Lovable default); configurable for Vercel |

This is **not** a plain Vite SPA — it is a full-stack app with server-side routes (e.g. `/api/chat`).

### App Structure

```
KapsAutoSpares/
├── src/
│   ├── routes/           ← File-based routing (TanStack Router)
│   │   ├── __root.tsx    ← App shell, global layout, error/404 pages
│   │   ├── index.tsx     ← Landing page (/)
│   │   ├── admin.tsx     ← Admin dashboard (/admin)
│   │   └── api/chat.ts   ← Server API route for AI chat
│   ├── components/       ← UI components (request form, chat assistant, shadcn/ui)
│   ├── integrations/
│   │   ├── supabase/     ← Supabase client, auth, types
│   │   └── lovable/      ← Lovable OAuth helper
│   ├── lib/              ← Utilities, AI gateway, company profile
│   ├── router.tsx        ← Router factory
│   ├── start.ts          ← TanStack Start middleware config
│   └── server.ts         ← SSR entry wrapper
├── supabase/
│   └── migrations/       ← SQL schema migrations
└── kaps-helper-bot_260708.backup  ← PostgreSQL dump
```

### Routes

| URL | Purpose |
|---|---|
| `/` | Public landing page — services, branches, contact, spare-parts request form, AI chat widget |
| `/admin` | Protected admin portal — sign in, view/update customer requests |
| `/api/chat` | Server-side AI chat endpoint (POST) |

### Database Tables

- **`requests`** — customer spare-parts/service inquiries (public insert, admin read/update)
- **`user_roles`** — maps Supabase auth users to `admin` or `user` roles
- **`private.has_role()`** — security-definer function used by RLS policies

### Data Flow

1. Visitors submit requests via `RequestForm` → inserts into Supabase `requests` table (anon allowed).
2. AI chat widget calls `/api/chat` → uses Lovable AI Gateway (needs `LOVABLE_API_KEY`).
3. Admins sign in at `/admin` → Supabase Auth + `user_roles` check → dashboard to manage requests.

---

## 2. Localhost Testing

### Prerequisites

- **Node.js** (v18+ recommended; v24 works)
- npm (comes with Node)

### Commands

Open a terminal in the project root (`c:\Users\TECHARBOR\Desktop\KapsAutoSpares`):

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at **http://localhost:8080/** (Lovable's TanStack config pins port 8080).

### Other Useful Commands

```bash
npm run build        # Production build
npm run preview      # Preview production build locally
npm run lint         # ESLint
```

### What You Can Test Locally

| Feature | Works without extra setup? |
|---|---|
| Landing page | Yes |
| Request form | Needs working Supabase connection (`.env` keys) |
| Admin portal | Needs Supabase Auth + admin user in `user_roles` |
| AI chat | Needs `LOVABLE_API_KEY` (optional; chat errors without it) |

---

## 3. Database Configuration Check

### Current `.env` (present)

The exported `.env` contains credentials from the **original Lovable Supabase project**:

```env
SUPABASE_PROJECT_ID="..."
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_URL="https://....supabase.co"
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
VITE_SUPABASE_URL="https://....supabase.co"
```

Both server-side (`SUPABASE_*`) and client-side (`VITE_SUPABASE_*`) variants are set — Vite only exposes `VITE_` prefixed vars to the browser.

### Missing / Needed After Creating a New Supabase Project

| Variable | Required for | Notes |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin client (`client.server.ts`) | Get from Supabase Dashboard → Project Settings → API → `service_role` secret key. **Never expose to the browser.** |
| `LOVABLE_API_KEY` | AI chat assistant (`/api/chat`) | Optional for demo; only needed if you want the chat widget working outside Lovable |
| Updated `SUPABASE_*` / `VITE_SUPABASE_*` | Everything | Replace all 6 values with your **new** Supabase project credentials after migration |

### Complete `.env` Template for Your New Supabase Project

```env
# Server-side (SSR, API routes)
SUPABASE_PROJECT_ID="your-new-project-ref"
SUPABASE_URL="https://your-new-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."

# Client-side (browser — must be prefixed with VITE_)
VITE_SUPABASE_PROJECT_ID="your-new-project-ref"
VITE_SUPABASE_URL="https://your-new-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Optional — AI chat only
LOVABLE_API_KEY="your-lovable-api-key"
```

### Where to Find Supabase Keys

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project
3. **Project Settings** (gear icon) → **API**
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`, service role) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Database Migration via `pg_restore`

The backup file `kaps-helper-bot_260708.backup` in the project root is a **PostgreSQL custom-format dump** (binary, v1.16) — exactly what `pg_restore` expects.

### Step 0: Install PostgreSQL Client Tools

`pg_restore` is required and may not be installed by default on Windows.

**Option A — Official installer (recommended on Windows)**

1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer; at "Select Components", check **Command Line Tools**
3. Add the `bin` folder to your PATH (e.g. `C:\Program Files\PostgreSQL\17\bin`)
4. Verify:

```bash
pg_restore --version
```

**Option B — Package manager**

```bash
# Chocolatey
choco install postgresql

# or Scoop
scoop install postgresql
```

### Step 1: Create a Fresh Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Choose a name, strong database password, and region
3. **Save the database password** — you will need it for `pg_restore`
4. Wait until the project is fully provisioned (green status)

### Step 2: Find Your Supabase Connection String

1. In your new project: **Project Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Choose **Direct connection** (not "Transaction pooler" — `pg_restore` needs a direct session)
5. Copy the string; it looks like:

```
postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Or the older format:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

6. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

> **Tip:** If you forgot the password, reset it under **Project Settings → Database → Database password → Reset**.

### Step 3: Restore the Backup

From your project root in Git Bash or PowerShell:

```bash
cd "c:/Users/TECHARBOR/Desktop/KapsAutoSpares"

pg_restore \
  --verbose \
  --no-owner \
  --no-acl \
  --dbname="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  "kaps-helper-bot_260708.backup"
```

**Flag explanations:**

| Flag | Why |
|---|---|
| `--no-owner` | Objects are owned by `postgres` in Supabase, not your local user |
| `--no-acl` | Skips permission grants that conflict with Supabase's managed ACLs |
| `--verbose` | Shows progress so you can see what's happening |

### Expected Warnings/Errors (Usually Safe to Ignore)

On a fresh Supabase project you may see errors like:

- `role "..." does not exist` — ignored by `--no-owner`
- `extension "..." already exists` — Supabase pre-installs common extensions
- `schema "auth" already exists` — Supabase manages the `auth` schema

As long as your **`public.requests`**, **`public.user_roles`**, and **`auth.users`** data restore successfully, you are fine.

### Step 4: Verify the Restore

In Supabase Dashboard:

1. **Table Editor** → confirm `requests` and `user_roles` tables exist with data
2. **Authentication** → **Users** → confirm admin users were restored
3. **SQL Editor** → run:

```sql
SELECT count(*) FROM public.requests;
SELECT * FROM public.user_roles;
```

### Step 5: Update Your `.env`

Replace all Supabase values in `.env` with your **new** project's credentials (see Section 3 template). Restart the dev server:

```bash
# Stop the running server (Ctrl+C), then:
npm run dev
```

### Step 6: Test Admin Access

1. Open http://localhost:8080/admin
2. Sign in with an admin account from the restored `auth.users`
3. If Google OAuth was used in Lovable, email/password sign-in should work if those credentials were in the backup
4. If you need a new admin: create a user in Supabase Auth, then run in SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('the-user-uuid-from-auth-users', 'admin');
```

### Alternative: Schema via Migrations + Data Restore

If `pg_restore` struggles with schema conflicts, you can:

1. Run the SQL files in `supabase/migrations/` via Supabase SQL Editor (in order by timestamp)
2. Restore **data only**:

```bash
pg_restore \
  --verbose \
  --no-owner \
  --no-acl \
  --data-only \
  --dbname="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  "kaps-helper-bot_260708.backup"
```

---

## 5. Deployment Roadmap (Vercel + Supabase)

This app uses **TanStack Start with SSR and API routes**, so it needs a server/edge runtime — not a static SPA deploy.

### A. Configure Vercel Build Target

Update `vite.config.ts` to target Vercel instead of the default Cloudflare preset:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
```

### B. Push to GitHub

```bash
git init   # if not already a repo
git add .
git commit -m "Initial export from Lovable"
git remote add origin https://github.com/YOUR_USER/KapsAutoSpares.git
git push -u origin main
```

### C. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Vercel should auto-detect the framework; set:
   - **Build Command:** `npm run build`
   - **Output Directory:** leave as auto-detected (Nitro handles this)
4. Add **Environment Variables** (same as `.env`, but in Vercel dashboard):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | `https://your-ref.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` |
   | `VITE_SUPABASE_URL` | same as `SUPABASE_URL` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | same as publishable key |
   | `VITE_SUPABASE_PROJECT_ID` | your project ref |
   | `LOVABLE_API_KEY` | optional, for chat |

5. Deploy

### D. Post-Deploy Supabase Config

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/**` and `http://localhost:8080/**`

This is required for admin login redirects to work in production.

### E. What Works Where

| Feature | Local | Vercel |
|---|---|---|
| Landing page | Yes | Yes |
| Request form → Supabase | Yes (with `.env`) | Yes (with env vars) |
| Admin dashboard | Yes | Yes |
| AI chat | Needs `LOVABLE_API_KEY` | Same |
| Google OAuth via Lovable | May not work outside Lovable | Use Supabase-native Google provider instead |

---

## Recommended Order of Operations

```mermaid
flowchart TD
    A[Install pg_restore] --> B[Create new Supabase project]
    B --> C[pg_restore backup into Supabase]
    C --> D[Update .env with new Supabase keys]
    D --> E[npm install && npm run dev]
    E --> F[Test form + admin at localhost:8080]
    F --> G[Add nitro preset vercel to vite.config]
    G --> H[Push to GitHub + deploy on Vercel]
    H --> I[Set env vars + auth redirect URLs in Supabase]
```

---

## Quick Reference

| Task | Command / URL |
|---|---|
| Install deps | `npm install` |
| Run locally | `npm run dev` → http://localhost:8080 |
| Restore DB | `pg_restore --verbose --no-owner --no-acl --dbname="..." kaps-helper-bot_260708.backup` |
| Supabase dashboard | https://supabase.com/dashboard |
| Vercel deploy | https://vercel.com |
