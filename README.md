# AI Tribal Scholar Education

Scholarship application, scrutiny, screening and award management portal for
Scheduled Tribe students.

React 19 + TypeScript + Vite + Tailwind CSS + Recharts.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL after the development server starts (port 3000).

## Build

```bash
npm run build     # type-checks with tsc, then builds to dist/
npm run preview   # serves the production build locally
```

## Deploy to Vercel

The Vite app lives at the repository root, so Vercel's Vite framework preset is
auto-detected and **no build settings need changing**. Leave **Root Directory**
at `/` and **Build Command** at `npm run build`.

Via the Vercel dashboard:

1. Import the repository as a new project.
2. Accept the auto-detected settings (Framework Preset: Vite, Output: `dist`).
3. Deploy.

Via the CLI:

```bash
npx vercel login
npx vercel deploy --prod --scope hosurichandrahass
```

No `vercel.json` is required. The app is a single-page application with
in-app state-based navigation rather than URL routing, so no SPA rewrite rule is
needed either.

See [`CODE-ANALYSIS.md`](./CODE-ANALYSIS.md) for the codebase breakdown.