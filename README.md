# Steel Plant Maintenance Dashboard — Frontend

**Equipment history, vibration trends and safety follow-up in one electrical-maintenance workspace.**

[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black)](https://steel-plant-frontend.vercel.app)
![Build command](https://img.shields.io/badge/Build-npm_run_build-blue)
![Tech stack](https://img.shields.io/badge/Stack-React_19_%7C_CRA_5-61dafb)

This React application helps steel-plant electrical teams find equipment, review maintenance history, record work and track safety actions across CGL, CRM, CCL and Pickling areas. It combines motor records, crane inspections, AC repairs, safety workflows, trend visualizations and downloadable reports.

- **Live deployment URL:** [steel-plant-frontend.vercel.app](https://steel-plant-frontend.vercel.app)
- **Configured API:** [steel-plant-dashboard-1.onrender.com](https://steel-plant-dashboard-1.onrender.com)
- **Backend repository:** [steel-plant-dashboard](https://github.com/satishkumar123123/steel-plant-dashboard)

The Vercel URL is defined in `src/utils/motorQr.js`; the API URL comes from the committed `.env`. Badges describe the configured platform and available build command, not monitored uptime or a passing CI pipeline.

## ✨ Features & Capabilities

### Core logic

- Browse motors by production line, area and bridle, then open individual asset details.
- Submit motor replacements, vibration readings and greasing activities to the API.
- Record crane safety/brake inspections and resolve recorded faults with repair details.
- Record AC repairs and equipment status.
- Track unsafe conditions through raised/open, closed and reopened states.
- Manage training, safety walks and near-miss investigations, including linking walk observations to unsafe issues.
- Manage FAC, MTI and LTI incidents with separate classification and action status, reviewed reclassification and change history.

### Dashboard / UI

- Plant navigation for CGL, CRM, CCL and Pickling, plus crane and safety dashboards.
- Master motor search with case-normalized, trimmed matching and plant, area and status filters.
- Motor vibration history, bar/line charts and latest/previous/average/maximum summaries.
- Bridle overview for CGL bridles 1–10 plus Hot Bridle, and CCL bridles 1–5: 32 A/B motor positions.
- Shared A/B vertical scales, exact-reading tables, availability messages and badges for latest readings older than 30 days.
- Crane inspection trends, recurring faults and open/resolved fault counts.
- QR directory with search, plant filtering and 24 motor cards per page.
- QR PNG downloads, single-label PDFs and bulk PDFs for the filtered motor directory.
- Downloadable motor, crane, bridle and safety PDFs generated in the browser.
- Loading, error/retry and empty messages on the newer directory/workflow screens; keyboard-accessible vibration tabs and labelled chart views.

### Data handling

- Browser Fetch API calls to the separate Express backend; writes remain in MongoDB.
- Latest 15 valid vibration readings are selected by test date, sorted oldest to newest for plotting.
- Invalid dates and non-finite/negative vibration values are excluded from charts; zero readings remain valid.
- Missing readings and duplicate bridle matches are labelled rather than silently substituted.
- Bridle reading requests run with up to four concurrent workers.
- Selected pages cancel in-flight fetches during cleanup and use explicit refresh/retry controls.
- Workflow forms send record versions so the backend can reject stale updates.
- PDF reports use snapshots loaded for the report flow; refresh before relying on current values.
- There is no websocket, polling-based telemetry stream or SCADA connector in the current implementation.

## 🛠 Tech Stack & Architecture

| Layer | Implementation |
| --- | --- |
| Frontend | React `^19.2.3`, React DOM `^19.2.3`, JavaScript/JSX |
| Routing | React Router DOM `^7.13.0`, BrowserRouter |
| State management | React hooks and component-local state |
| Styling | Plain CSS files and inline styles |
| Charts | Custom SVG rendering and data utilities |
| Build tool | Create React App through `react-scripts 5.0.1` |
| HTTP | Native Fetch API |
| PDF export | `pdf-lib ^1.17.1`; browser canvas where needed |
| QR generation | `qrcode ^1.5.4` |
| Test tooling | CRA/Jest and Testing Library packages |
| Other dependency | `web-vitals ^2.1.4`; helper file is present |
| Backend / database | Separate Express 5 API with Mongoose 9 and MongoDB |
| Deployment / tooling | Vercel frontend, Render API URL, npm lockfile, Git/GitHub |

The frontend has no database credentials, server routes, ORM or cache service. Its route components call the API directly. Shared utilities normalize records, compute summaries and generate reports; charts use SVG without an external charting library.

The backend uses direct MongoDB collection operations through Mongoose rather than schema model declarations. Crane inspection saves and safety-walk observation linking require a transaction-capable MongoDB deployment.

### Main browser routes

| Area | Routes |
| --- | --- |
| Home / directories | `/`, `/motors/search`, `/motors/qr`, `/motors/bridle-trends` |
| Motor details | `/motor/:id` |
| CGL | `/cgl`, `/cgl/bridles`, `/cgl/bridle/:bridleNo`, `/cgl/area/:area` |
| CCL | `/ccl`, `/ccl/bridles`, `/ccl/bridle/:bridleNo`, `/ccl/area/:area` |
| CRM | `/crm`, `/crm/motor`, `/crm/trimmer/:area` |
| Pickling | `/pickling`, `/pickling/area/:area` |
| Cranes | `/crane`, `/crane/plant/:plant`, `/crane/detail/:id` |
| ACs | `/cgl/acs`, `/crm/acs`, `/ccl/acs`, `/pickling/acs`, `/ac-detail/:id` |
| Safety dashboards | `/safety`, `/safety/leading`, `/safety/lagging` |
| Leading safety | `/safety/leading/training`, `/safety/leading/nearmiss`, `/safety/leading/safetywalk`, `/safety/leading/unsafeclosed` |
| Lagging safety | `/safety/lagging/fac`, `/safety/lagging/mti`, `/safety/lagging/lti`, `/safety/lagging/unsaferaised` |

Browser routes and API paths are different. For example, `/motor/:id` renders a page that requests `GET /motors/:id` from the API. The backend's root paths do not have an `/api` prefix.

### API integration

| UI capability | Backend paths used |
| --- | --- |
| Directory and plant motor lists | `/motor-search`, `/motors/:plant/:area`, `/motors/:plant/:area/:bridleNo` |
| Motor detail / maintenance | `/motors/:id`, `/motor-history/:motorId`, `/change-motor`, `/vibration-test`, `/vibration-test/:motorId`, `/greasing`, `/greasing/:motorId` |
| Crane inspections / resolution | `/cranes?plant=...`, `/crane/:id`, `/crane-history/:craneId`, `/crane-history/:historyId/issues/:issueKey/resolve` |
| AC records | `/acs/:plant`, `/ac/:id`, `/ac-history/:id` |
| Unsafe issues | `/unsafe-issues`, `/unsafe-issues/:id`, `/safety-history` |
| Training / walk / near miss | `/safety-workflow/:kind`, `/safety-workflow/:kind/:id`, `/safety-workflow/:kind/:id/history` |
| Observation linking | `/safety-workflow/walk/:id/observations/:observationId/link` |
| Injury follow-up | `/injury-incidents`, `/injury-incidents/:id`, `/injury-incidents/:id/history` |

`:kind` is `training`, `walk` or `near`. See the backend README and workflow modules for HTTP methods and request validation.

## 📁 Project Structure

```text
steel-plant-frontend/
├── public/                         # HTML shell, icons, manifest and robots.txt
├── src/
│   ├── index.js                    # React root entry point
│   ├── index.css                   # Global styles
│   ├── App.js                      # BrowserRouter and application routes
│   ├── App.css                     # App stylesheet
│   ├── App.test.js                 # Original CRA sample test
│   ├── setupTests.js               # Testing Library matchers
│   ├── reportWebVitals.js          # Web-vitals helper
│   ├── logo.svg                    # Original React logo asset
│   ├── components/                 # Reusable motor cards, charts and QR cards
│   │   ├── MotorCard.jsx           # Equipment card and detail navigation
│   │   ├── MotorQrCard.jsx         # QR preview and per-motor downloads
│   │   ├── VibrationHistoryTabs.jsx # History and SVG chart tabs
│   │   ├── CraneAnalytics.jsx      # Inspection summaries and fault trends
│   │   ├── BridleComparison.jsx    # A/B date-based comparison component
│   │   └── BridleButton.jsx        # Bridle navigation button
│   ├── pages/                      # Plant, asset, search and safety screens
│   │   ├── SteelPlantDashboard.jsx # Main navigation
│   │   ├── MotorDetail.jsx         # Replacement, greasing, readings and report
│   │   ├── MotorSearch.jsx         # Master directory and filters
│   │   ├── MotorQrDirectory.jsx    # Paginated QR cards and bulk export
│   │   ├── BridleTrends.jsx        # CGL/CCL overview and PDF export
│   │   ├── CraneDetail.jsx         # Inspection form, fault repairs and history
│   │   ├── ACDetail.jsx            # Repair form and history
│   │   ├── SafetyRecords.jsx       # Training, walk and near-miss workflows
│   │   ├── UnsafeIssues.jsx        # Open/closed unsafe-condition workflow
│   │   ├── InjuryIncidents.jsx     # FAC/MTI/LTI follow-up and classification
│   │   └── ...                     # Plant navigation, category wrappers and CSS
│   └── utils/                      # Filters, summaries, QR and PDF generation
│       ├── motorFilters.js         # Normalized directory matching
│       ├── vibrationData.js        # Valid-reading selection and summaries
│       ├── bridleData.js            # Bridle groups and A/B asset matching
│       ├── bridleInsights.js        # Overview summaries and comparison scale
│       ├── craneData.js            # Inspection and fault analytics
│       ├── safetyData.js           # Form fields, summaries and date helpers
│       ├── injuryData.js           # Category-specific injury fields
│       ├── motorQr.js              # Fixed deployment URL and QR helpers
│       ├── motorQrPdf.js           # Printable labels
│       └── *Report.js              # Motor, crane, bridle and safety PDFs
├── .env                            # Committed public API origin
├── .gitignore                      # Generated files and local env overrides
├── package.json                    # Dependencies, scripts and browserslist
├── package-lock.json               # Locked dependency graph
└── README.md                       # Project documentation
```

There are no backend `api/`, `routes/` or `models/` directories here, and no committed `vercel.json`, `.env.example` or GitHub Actions workflow. Some original CRA files and unused components remain; `App.js` defines the active page routes.

## 🚀 Getting Started (Local Setup)

### Prerequisites

- Node.js **20 or newer**, required by the locked React Router dependency. For both repositories together, use **20.19.0 or newer**; prefer an actively supported release.
- npm and Git.
- A reachable companion backend with equipment data. The backend listens locally on **5005**.

### 1. Clone and install

```bash
git clone https://github.com/satishkumar123123/steel-plant-frontend.git
cd steel-plant-frontend
npm ci
```

### 2. Configure the API origin

There is currently **no committed `.env.example`**. Create `.env.local` in the repository root:

```dotenv
REACT_APP_API_URL=http://localhost:5005
```

The existing `.env` points at the configured Render API. A `.env.local` override keeps local development separate. Use the API origin without a trailing slash or an `/api` suffix. Restart the development server after changing environment variables.

To run the backend in a separate terminal:

```bash
git clone https://github.com/satishkumar123123/steel-plant-dashboard.git
cd steel-plant-dashboard
npm ci
# Create .env with your own MONGO_URI before starting.
node server.js
```

Follow the backend README for MongoDB replica-set requirements and initial asset data. This frontend does not seed a database.

### 3. Start development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The project uses CRA, so there is no `npm run dev` script.

### 4. Build and preview production output

```bash
npm run build
npx serve -s build
```

`build/` contains the static production assets. `serve` is an optional preview tool fetched by npx, not a project dependency. Its `-s` option falls back to the HTML shell for client-side routes. There is no dedicated `preview` npm script.

### 5. Existing test command

```bash
npm test -- --watchAll=false
```

The committed `src/App.test.js` still asserts a “Learn React” link from the original CRA template, which the current application does not render. Treat it as outdated test scaffolding, not feature coverage or proof of a passing suite. No passing frontend build/test result is asserted by this documentation update.

## ⚙️ Environment Variables

| Variable | Required | Description | Dummy example |
| --- | --- | --- | --- |
| `REACT_APP_API_URL` | Yes | Base origin of the Express API; read by components and embedded at build time | `http://localhost:5005` |

CRA embeds `REACT_APP_*` values into browser assets. This variable is a public endpoint, not a secret. Database connection strings and private credentials belong only on the backend.

**QR deployment configuration:** `MOTOR_SITE` in `src/utils/motorQr.js` is a source constant set to `https://steel-plant-frontend.vercel.app`, not an environment variable. QR codes open `/motor/:id` on that domain even when generated locally. Change this constant and rebuild if deploying under another domain.

## 🌐 Deployment Notes (Vercel)

1. Import this GitHub repository into Vercel.
2. Select the **Create React App** framework preset and the repository root.
3. Use install command `npm ci`, build command `npm run build`, and output directory `build`.
4. Select a Node runtime satisfying the dependency requirements above.
5. Set `REACT_APP_API_URL` in the Vercel dashboard for each environment you use. For the configured deployment, it points at the Render backend origin.
6. Rebuild/redeploy after changing environment variables; they are compiled into static assets.
7. Verify direct navigation and browser refresh on nested routes such as `/motor/:id`, since the application uses BrowserRouter.
8. Confirm QR links target the intended deployment domain.

No `vercel.json` is committed. If your deployment does not provide SPA fallback, configure a rewrite to `/index.html` for frontend routes. The API is external and does not run from this repository.

Git-triggered deployments can be configured through Vercel's Git integration; there is no checked-in CI/CD workflow or remote build-status badge. CRA builds on Vercel may treat lint warnings as failures when CI mode is enabled; review build logs rather than assuming local development success proves a deployment build passes.

### Operational notes

- The current backend uses unrestricted CORS, so frontend origins are not allowlisted.
- Neither repository implements login or role-based authorization. Named editors/reviewers in forms are entered text, not authenticated identities.
- Equipment updates and reports depend on API/database availability.
- Data is loaded on navigation or explicit refresh; trend charts show recorded measurements rather than continuous telemetry.
- Backend plant/area queries use exact stored values. UI labels and stored values can differ in case, so populate assets to match the requested API values.
- The master directory is fetched in full and filtered locally; QR pagination limits rendering, not the number of records returned by the server.

## 🤝 Contributing & License

1. Fork the repository and clone your fork.
2. Create a branch: `git switch -c feature/your-change`.
3. Keep components, shared utilities and backend contracts consistent.
4. Run `npm run build`; review the existing test scaffolding and run appropriate checks for the change.
5. Check affected loading, empty, failure, form and report states.
6. Commit, push your branch and open a pull request describing the behavior and validation.

**License:** No license field or standalone `LICENSE` file is present in this frontend repository. An explicit reuse license has not been specified; do not assume the backend's ISC declaration applies to this repository.
