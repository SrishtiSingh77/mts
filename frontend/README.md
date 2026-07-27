# Typeform Clone — Frontend

Next.js 15 (App Router, TypeScript) frontend for a Typeform clone: a drag-and-drop
form builder, the one-question-at-a-time respondent flow, and a results view with
per-question stats, funnel drop-off and CSV export.

This repository holds the frontend only. The FastAPI backend, database schema and
full API reference live in the main repository:
<https://github.com/SrishtiSingh77/mts>

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit if your API is not on localhost:8000
npm run dev
```

Open <http://localhost:3000>.

The app needs the API running. From the main repository:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The database creates and seeds itself on first boot.

---

## Environment

| Variable | Required | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:8000/api` |

Two things to get right:

- It **must end in `/api`**, with no trailing slash.
- `NEXT_PUBLIC_*` values are inlined at **build time**, so changing it requires a
  rebuild — editing it on a deployed host and restarting is not enough.

---

## Layout

```
src/
  app/                       routes
    page.tsx                 dashboard (form list)
    builder/[formId]/        builder: content, workflow, share, settings
    f/[shareId]/             public respondent flow (published forms only)
    preview/[formId]/        creator preview (works on drafts, never saves)
    forms/[formId]/results/  insights, summary, responses
    not-found.tsx            404
  components/
    Questions/               one input component per question type + registry
    Respondent/              welcome / question / footer / ending screens
    Builder/                 sidebar, canvas, inspectors, workflow, share, settings
    Results/                 summary cards, responses table, detail panel
    ui/                      portal-based dropdown menu
  hooks/useFormFlow.ts       respondent state machine
  lib/
    api.ts                   typed fetch client
    validation.ts            mirror of the server's validation rules
    logic.ts                 mirror of the server's branching rules
    questionTypes.ts         question type labels and icons
    theme.ts                 form theme presets and helpers
    labels.ts                display fallbacks for blank titles
```

Three decisions worth knowing:

**One question-input registry, two consumers.** `components/Questions/QuestionInput.tsx`
maps a question type to a component. The respondent flow renders it interactively;
the builder canvas renders the same component with `disabled`. The live preview is
therefore the real input, not a lookalike.

**Validation and branching are mirrored, not owned.** `lib/validation.ts` and
`lib/logic.ts` repeat the server's rules so respondents get instant inline feedback,
but the server re-checks everything and is the only authority.
`GET /api/meta/validation-rules` exists so the two can be diffed rather than trusted.

**Dark mode is a token swap.** `globals.css` declares the palette in `@theme`; `.dark`
re-points the same CSS variables, so every component flips without markup changes.
The respondent flow deliberately opts out via `.tf-light-scope` — published forms
render the creator's chosen theme, not the viewer's preference.

---

## Scripts

```bash
npm run dev       # dev server on :3000
npm run build     # production build
npm run start     # serve the production build
npm run lint      # eslint
npx tsc --noEmit  # typecheck
```

---

## Deploying to Vercel

Because this repository has `package.json` at its root, Vercel detects it with no
extra configuration:

1. Import the repository at <https://vercel.com/new>
2. Leave **Root Directory** blank
3. Add `NEXT_PUBLIC_API_URL` pointing at your deployed API, ending in `/api`
4. Deploy

If the site loads but no forms appear, `NEXT_PUBLIC_API_URL` is wrong or the API's
`ALLOWED_ORIGINS` does not include your Vercel origin.
