# AMA Desktop Dashboard

Author: AMA Dev Team

## What It Means

AMA Desktop Dashboard is the desktop-facing web dashboard for the AMA attendance management system. It gives managers, HR users, and administrators a single place to monitor attendance activity, employee locations, geofences, reports, exceptions, devices, and audit logs.

The application is built as a React and Vite single-page application. It connects to the AMA backend API, stores authentication tokens in the browser, refreshes sessions automatically, protects routes by role, and renders a 3D attendance map with ArcGIS.

Main product areas:

| Area       | Purpose                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------- |
| Overview   | Shows daily attendance KPIs, active locations, late counts, absence counts, and fraud alerts. |
| 3D Map     | Displays employee location points in an ArcGIS scene.                                         |
| Geofences  | Manages attendance zones, buildings, floors, and allowed check-in/check-out areas.            |
| Reports    | Shows attendance summaries and export-ready report data.                                      |
| Exceptions | Helps review abnormal attendance or fraud-related events.                                     |
| Admin      | Manages employees, departments, shifts, and devices.                                          |
| Audit Logs | Shows important system actions for administrative review.                                     |

## Architecture

The app is organized around a small React shell, route-level feature pages, shared UI components, typed services, and configuration helpers.

```text
index.html
  -> src/app/main.tsx
  -> src/app/App.tsx
  -> SessionProvider
  -> RouterProvider
  -> ProtectedRoute and DashboardLayout
  -> feature pages
  -> services
  -> apiClient
  -> AMA backend API
```

Key architecture parts:

| Part             | Location                               | Responsibility                                                                                                       |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| App entry        | `src/app/main.tsx`                     | Mounts React, loads global styles, and starts the application.                                                       |
| App shell        | `src/app/App.tsx`                      | Wraps the router with session state.                                                                                 |
| Routing          | `src/routes/routeConfig.tsx`           | Defines login, dashboard, protected routes, and fallback route behavior.                                             |
| Layout           | `src/routes/DashboardLayout.tsx`       | Provides sidebar navigation, top bar, and dashboard content outlet.                                                  |
| Route protection | `src/routes/ProtectedRoute.tsx`        | Blocks access when the current account role cannot open a route.                                                     |
| Session state    | `src/lib/auth/session.tsx`             | Loads the current user, stores role information, and clears invalid sessions.                                        |
| Permissions      | `src/lib/auth/permissions.ts`          | Defines dashboard roles, route permissions, and action permissions.                                                  |
| API client       | `src/lib/api/apiClient.ts`             | Sends HTTP requests, adds bearer tokens, refreshes access tokens, handles downloads, and normalizes API errors.      |
| Services         | `src/services`                         | Provides feature-specific API functions for auth, dashboard, reports, geofences, employees, devices, and audit logs. |
| Types            | `src/types/api.ts`                     | Defines TypeScript models for API responses and dashboard data.                                                      |
| ArcGIS map       | `src/components/map` and `src/lib/map` | Builds the 3D SceneView and renders attendance location points.                                                      |
| UI components    | `src/components/ui`                    | Shared buttons, inputs, tables, cards, tabs, modals, drawers, toasts, and date picker controls.                      |

Data flow:

```text
User action
  -> React feature page
  -> service function
  -> shared API client
  -> backend endpoint under /api/v1
  -> typed response data
  -> page state update
```

Authentication flow:

```text
Login page
  -> authService.login()
  -> access token and refresh token saved in browser storage
  -> SessionProvider loads /auth/me
  -> ProtectedRoute checks role access
  -> API client refreshes access token on 401 when possible
```

Map flow:

```text
Map page
  -> ArcgisScene component
  -> buildArcgisRuntimeConfig()
  -> createSceneView()
  -> ArcGIS WebScene or default navigation basemap
  -> graphics layer with employee location points
```

## Folder Structure

```text
desktop/
|-- .env.example              Environment variable template
|-- .prettierrc               Prettier formatting rules
|-- eslint.config.js          ESLint configuration
|-- index.html                Vite HTML entry point
|-- package.json              npm scripts and dependencies
|-- package-lock.json         Locked npm dependency versions
|-- tsconfig.json             TypeScript project references
|-- tsconfig.app.json         TypeScript config for app code
|-- tsconfig.node.json        TypeScript config for Node/Vite config files
|-- vite.config.ts            Vite, React, alias, and Vitest configuration
|-- dev/                      Development notes or supporting local files
|-- dist/                     Generated production build output
|-- docs/                     Project documentation
|-- node_modules/             Installed dependencies
|-- src/
|   |-- app/                  App entry, app shell, and global CSS
|   |-- components/           Reusable UI, map, and page-state components
|   |-- features/             Route-level dashboard feature pages
|   |-- lib/                  Shared API, auth, config, i18n, map, and mock helpers
|   |-- routes/               React Router configuration, layout, and guards
|   |-- services/             API service modules grouped by domain
|   |-- test/                 Vitest and Testing Library setup
|   |-- types/                Shared TypeScript API types
|   |-- vite-env.d.ts         Vite TypeScript environment declarations
```

Important source folders:

| Folder                    | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `src/features/overview`   | Dashboard summary, KPIs, active locations, and refresh behavior. |
| `src/features/map`        | 3D attendance map screen.                                        |
| `src/features/geofences`  | Geofence and building management screens.                        |
| `src/features/reports`    | Attendance report screens.                                       |
| `src/features/exceptions` | Attendance exception review screens.                             |
| `src/features/admin`      | Employee, department, shift, and device administration screens.  |
| `src/features/audit`      | Audit log screen.                                                |

## How To Install

Requirements:

| Tool            | Version                                  |
| --------------- | ---------------------------------------- |
| Node.js         | 18 or newer, 20 LTS recommended          |
| npm             | Comes with Node.js                       |
| AMA backend API | Running and reachable from this frontend |

Install steps:

1. Open a terminal in the project folder.

```bash
cd desktop
```

2. Install dependencies from the lock file.

```bash
npm ci
```

3. Create a local environment file.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS or Linux:

```bash
cp .env.example .env.local
```

4. Update `.env.local` for your local environment.

```env
VITE_API_BASE_URL=/api/v1
VITE_ARCGIS_API_KEY=
VITE_ARCGIS_PORTAL_URL=https://www.arcgis.com
VITE_ARCGIS_WEBSCENE_ID=
VITE_ARCGIS_DEFAULT_CENTER_LNG=106.700981
VITE_ARCGIS_DEFAULT_CENTER_LAT=10.776889
VITE_ARCGIS_DEFAULT_ZOOM=17
VITE_APP_MODE=development
VITE_BYPASS_LOGIN=false
```

Environment notes:

| Variable                         | Meaning                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`              | API base URL. Use `/api/v1` in development so Vite proxies requests to the local backend and LAN clients do not call their own `localhost`. Absolute backend URLs are still supported. |
| `VITE_ARCGIS_API_KEY`            | ArcGIS API key. Leave empty for the default flat OSM map; set it when using protected ArcGIS basemaps, elevation, or WebScene resources. |
| `VITE_ARCGIS_PORTAL_URL`         | ArcGIS portal URL. Defaults to `https://www.arcgis.com`.                                                            |
| `VITE_ARCGIS_WEBSCENE_ID`        | Optional ArcGIS WebScene portal item ID. If empty, the app uses a flat OSM basemap.                                 |
| `VITE_ARCGIS_DEFAULT_CENTER_LNG` | Default map center longitude.                                                                                       |
| `VITE_ARCGIS_DEFAULT_CENTER_LAT` | Default map center latitude.                                                                                        |
| `VITE_ARCGIS_DEFAULT_ZOOM`       | Default map zoom level.                                                                                             |
| `VITE_APP_MODE`                  | Environment mode value for the frontend.                                                                            |
| `VITE_BYPASS_LOGIN`              | Development-only login bypass. Use `false` for normal authentication.                                               |

## How To Run

Start the development server:

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

Run a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run code quality checks:

```bash
npm run lint
npm run typecheck
npm run test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Useful npm scripts:

| Script       | Command                 | Purpose                                         |
| ------------ | ----------------------- | ----------------------------------------------- |
| `dev`        | `vite`                  | Starts the local development server.            |
| `build`      | `tsc -b && vite build`  | Type-checks and creates the production build.   |
| `preview`    | `vite preview`          | Serves the production build locally.            |
| `lint`       | `eslint .`              | Runs ESLint across the project.                 |
| `typecheck`  | `tsc -b --pretty false` | Runs TypeScript checks without building assets. |
| `test`       | `vitest run`            | Runs the test suite once.                       |
| `test:watch` | `vitest`                | Runs tests in watch mode.                       |

After the app starts, sign in with a dashboard role account. Supported dashboard roles are `manager`, `hr`, and `admin`. Some screens are restricted further, such as device trust and audit logs, which require `admin` access.
