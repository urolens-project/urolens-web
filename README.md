# UroLens Web

Web portal for **UroLens**, an AI-assisted urinalysis and laboratory information system. Receptionists register patients and manage specimens, Medical Technologists verify AI-analysed microscope fields, Laboratory Supervisors review and approve results, and physicians and patients view released results.

**Deployed URL:** https://portal.urolens.app (Azure Static Web Apps)
**Backend API:** https://urolens-api.azurewebsites.net (see [urolens-backend](https://github.com/urolens-project/urolens-backend))
**Mobile app:** [urolens-mobile](https://github.com/urolens-project/urolens-mobile)

## Features by role

| Role | What they do on the web |
|---|---|
| Receptionist | Register patients (with Data Privacy consent), encode lab requests, receive specimens, print QR labels, assign specimens to MedTechs, release results |
| Medical Technologist | Verify each captured microscope field, correct AI boxes and counts, confirm results for supervisor review |
| Laboratory Supervisor | Dashboard; approve, return for correction, or escalate results |
| Requesting Physician | Submit lab requests, view their patients' results |
| Patient | Log in with Patient ID, view released results, download a PDF |

## Tech stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4, Framer Motion, Lucide icons
- TanStack Query (server state), React Router 7, Axios
- Tests: Vitest + Testing Library (unit/component), Playwright (end-to-end)
- Tooling: ESLint, Husky + commitlint (Conventional Commits), pnpm 11.2.2
- Hosting: Azure Static Web Apps, deployed by GitHub Actions (`.github/workflows/deploy-web.yml`)

## Setup and installation

Prerequisites: Node.js 22 (the version CI uses), and pnpm (enable it with Corepack). Use pnpm only; `pnpm-lock.yaml` is the only lockfile.

```bash
git clone https://github.com/urolens-project/urolens-web.git
cd urolens-web
corepack enable
pnpm install
cp .env.example .env        # then edit VITE_API_BASE_URL if your backend is not on localhost:8000
pnpm dev                    # http://localhost:5173
```

A running backend is required for login and data. Run [urolens-backend](https://github.com/urolens-project/urolens-backend) locally, or point `VITE_API_BASE_URL` at the deployed API.

### Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Type-check and build to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit and component tests (Vitest) |
| `pnpm test:coverage` | Run tests with a coverage report |
| `pnpm test:e2e` | Run Playwright end-to-end tests |

## Environment variables

Names only; see `.env.example` for local defaults. Vite inlines these at **build time**, so changing them requires a rebuild.

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Backend **origin only**, e.g. `https://api.example.com`. No trailing slash and no `/api/v1` (the client appends `/api/v1`). The app refuses to start with an unset or malformed value. |
| `VITE_APP_ENV` | Environment label. |
| `VITE_SESSION_TIMEOUT_MINUTES` | Patient idle-timeout minutes (default 30). |

Deployment also uses the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` and the repository variable `VITE_API_BASE_URL`. Never commit `.env` files; they are ignored by `.gitignore`.

## Deployment (Azure Static Web Apps)

Every push to `main` runs `.github/workflows/deploy-web.yml`:

1. Checks that `VITE_API_BASE_URL` is set, uses `https://`, and has no trailing slash or `/api/v1`.
2. Runs `pnpm install --frozen-lockfile`, type-checks, and builds with Vite.
3. Uploads `dist/` to Azure Static Web Apps. `public/staticwebapp.config.json` rewrites deep links to `/index.html` for client-side routing.
4. The custom domain `portal.urolens.app` points to the Static Web App.

The backend CORS allow-list must include the web origin.
