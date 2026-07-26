# Deployment guide

Two things to deploy:

| Part | Goes on | Free? |
| --- | --- | --- |
| **Backend** — FastAPI + database | Render | Yes |
| **Frontend** — Next.js | Vercel | Yes |

Deploy the **backend first**, because the frontend needs its URL.

> The database needs one decision. Skip to [Part 3](#part-3--the-database) if you
> just want the short answer.

---

## Before you start

Push your code to GitHub (already done if you're reading this in the repo):

```bash
git push origin main
```

---

## Part 1 — Backend on Render

### 1. Create the service

1. Go to <https://dashboard.render.com> → sign in with GitHub.
2. **New +** → **Web Service**.
3. Pick the `mts` repository → **Connect**.

### 2. Fill in these settings

| Field | Value |
| --- | --- |
| **Name** | `typeform-clone-api` |
| **Language** | `Python 3` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

⚠️ **Root Directory must be `backend`.** Leaving it blank is the single most
common mistake — the build fails because `requirements.txt` isn't at the repo root.

### 3. Add environment variables

Scroll to **Environment Variables** → add:

| Key | Value |
| --- | --- |
| `PYTHON_VERSION` | `3.12.5` |
| `ALLOWED_ORIGINS` | `*` (tighten in step 5 of Part 2) |

### 4. Deploy

Click **Create Web Service** and wait ~2 minutes. When the log shows:

```
Seeding database with sample forms and responses...
Database successfully seeded!
Application startup complete.
```

you're live. Copy your URL — something like:

```
https://typeform-clone-api.onrender.com
```

### 5. Check it works

Open `https://YOUR-API-URL/docs` in a browser. You should see the interactive API
docs. Try `GET /api/forms` → **Execute**; it should return three seeded forms.

---

## Part 2 — Frontend on Vercel

### 1. Create the project

1. Go to <https://vercel.com/new> → sign in with GitHub.
2. **Import** the `mts` repository.

### 2. Fill in these settings

| Field | Value |
| --- | --- |
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | `frontend` |

⚠️ **Root Directory must be `frontend`**, same reasoning as above.

### 3. Add one environment variable

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://typeform-clone-api.onrender.com/api` |

Two things people get wrong here:

- It **must end in `/api`** — e.g. `https://typeform-clone-api.onrender.com/api`
- **No trailing slash** after `/api`

### 4. Deploy

Click **Deploy**, wait ~1 minute. You'll get a URL like
`https://mts-xyz.vercel.app`. That's your demo link.

### 5. Lock down CORS (do this now)

Go back to Render → your service → **Environment** → change `ALLOWED_ORIGINS`
from `*` to your Vercel URL:

```
https://mts-xyz.vercel.app
```

Save. Render redeploys automatically. This stops any other site from calling your API.

---

## Part 3 — The database

The app uses **SQLite**, which is a single file (`typeform.db`). It is created and
seeded automatically on first boot — there is no migration step and no database
server to set up.

The only question is **where that file lives**. Pick one:

### Option A — Do nothing (free, data resets)

**Best for submitting an assignment.**

Render's free tier gives each deploy a fresh filesystem. So:

- ✅ Works immediately, zero setup, zero cost
- ✅ The three sample forms and their responses **re-seed on every boot**, so the
  demo always looks populated
- ❌ Responses submitted by visitors are **lost** when the service redeploys or
  sleeps

For a demo link an evaluator clicks through, this is fine — they'll always see a
working, populated app.

**Also note:** free Render services sleep after ~15 minutes idle. The first
request after sleeping takes **up to 50 seconds**. Open your demo link once
before showing it to anyone.

### Option B — Persistent disk ($7/month, data survives)

Keeps the SQLite file across deploys.

1. Render → your service → **Settings** → upgrade Instance Type to **Starter**.
2. Go to **Disks** → **Add Disk**:
   - **Name**: `typeform-data`
   - **Mount Path**: `/data`
   - **Size**: `1 GB`
3. Go to **Environment** → add:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | `sqlite:////data/typeform.db` |

   **Four slashes.** `sqlite:///` is a relative path; `sqlite:////` is absolute.
   Three slashes here silently writes to the ephemeral disk instead.

Done. Responses now survive redeploys.

### Option C — Free Postgres (free, data survives)

Slightly more setup, but durable at no cost.

1. Add one line to `backend/requirements.txt`:

   ```
   psycopg2-binary>=2.9
   ```

2. Create a free database at <https://neon.tech> (or Render → **New +** →
   **Postgres**, free tier).
3. Copy its connection string and set it on Render:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | `postgresql://user:pass@host/dbname` |

4. Commit and push. Render redeploys, creates the tables, and seeds them.

No code changes needed — `backend/database.py` reads `DATABASE_URL` and adapts.

### Which should you pick?

| Your situation | Pick |
| --- | --- |
| Submitting an assignment / demo link | **Option A** |
| Real responses that must not vanish | **Option C** (free) or **B** (simplest) |

---

## Changing the sample data

Sample forms live in `backend/seed.py`. Seeding only runs when the `forms` table
is empty, so to reload it:

- **Option A**: just redeploy — the filesystem resets, so it re-seeds.
- **Option B/C**: delete the rows (or the `typeform.db` file) and restart.

---

## Schema changes are handled for you

If you add a column to `backend/models.py` and deploy over an existing database,
`migrations.py` adds the missing column on startup and logs it:

```
Schema updated, added columns: forms.welcome_show, forms.ending_show_social
```

Existing rows get the column's default. **You never need to wipe the database to
deploy a schema change.**

It only ever *adds* columns. Renaming or removing a column, or changing its type,
still needs to be done by hand.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Frontend loads but no forms appear | `NEXT_PUBLIC_API_URL` wrong | Must end in `/api`, no trailing slash. Re-deploy after changing it — Next.js bakes `NEXT_PUBLIC_*` in at build time. |
| Browser console: `CORS policy` error | `ALLOWED_ORIGINS` doesn't match | Set it to your exact Vercel URL, including `https://` |
| First load takes ~50 seconds | Free Render service was asleep | Expected. Load it once beforehand. |
| Render build fails, `requirements.txt` not found | Root Directory not set | Set it to `backend` |
| Vercel build fails, no `package.json` | Root Directory not set | Set it to `frontend` |
| Responses disappeared | Option A, ephemeral disk | Expected — switch to Option B or C |
| Public form link 404s | The form is a draft | Open it in the builder → **Share** → **Publish** |

---

## Quick reference

**Backend (Render)**

```
Root Directory:  backend
Build:           pip install -r requirements.txt
Start:           uvicorn main:app --host 0.0.0.0 --port $PORT
Env:             PYTHON_VERSION=3.12.5
                 ALLOWED_ORIGINS=https://your-app.vercel.app
                 DATABASE_URL=...          (only for Option B or C)
```

**Frontend (Vercel)**

```
Root Directory:  frontend
Env:             NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
```

**Submit both links**

```
GitHub:  https://github.com/SrishtiSingh77/mts
Demo:    https://your-app.vercel.app
```
