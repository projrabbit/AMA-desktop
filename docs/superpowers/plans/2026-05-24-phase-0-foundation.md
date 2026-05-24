# Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React + TypeScript desktop dashboard foundation with real API services, contract-shaped mocks, ArcGIS integration, Vietnamese UI primitives, protected routing, role permissions, and verification scripts.

**Architecture:** The app is a Vite React dashboard with shared infrastructure in `src/lib`, endpoint-focused services in `src/services`, reusable UI in `src/components`, route guards in `src/routes`, and screen shells in `src/features`. API calls use real OpenAPI-derived endpoint paths while mocks live separately under `src/lib/mocks` for tests and disconnected UI development. ArcGIS is isolated behind `src/lib/map` and `src/components/map/ArcgisScene.tsx` so screen code uses app-level props instead of raw ArcGIS classes.

**Tech Stack:** React 19, TypeScript strict mode, Vite, React Router, Vitest, Testing Library, ESLint, Prettier, `@arcgis/core`, native Fetch API.

---

## Execution Notes

The user will commit manually. Do not run `git commit` unless the user explicitly requests it.

The backend API may not be started during implementation. Build all services as real API calls and use tests with mocked `fetch` rather than live HTTP requests.

Use `dev/openAPI.json` as the API contract source. Preserve the confirmed trailing slash endpoints: `/buildings/`, `/geofences/`, and `/audit-logs/`.

## File Structure Map

Create or modify these files.

- Create: `package.json` for scripts and dependencies.
- Create: `index.html` for Vite root.
- Create: `vite.config.ts` for React, aliases, and Vitest.
- Create: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` for strict TypeScript.
- Create: `eslint.config.js`, `.prettierrc`, `.gitignore` for linting and formatting.
- Create: `.env.example` documenting API and ArcGIS variables.
- Create: `src/app/main.tsx`, `src/app/App.tsx`, `src/app/global.css`, `src/vite-env.d.ts` for app bootstrapping.
- Create: `src/test/setup.ts` for Vitest DOM setup.
- Create: `src/types/api.ts` for OpenAPI-shaped domain types.
- Create: `src/lib/config/env.ts` for environment normalization.
- Create: `src/lib/api/apiErrors.ts`, `src/lib/api/apiClient.ts`, `src/lib/api/tokenStorage.ts` for HTTP infrastructure.
- Create: `src/lib/i18n/errorMessages.ts`, `src/lib/i18n/labels.ts` for Vietnamese copy maps.
- Create: `src/lib/auth/permissions.ts`, `src/lib/auth/session.tsx` for role and auth state.
- Create: `src/lib/mocks/authMocks.ts`, `src/lib/mocks/dashboardMocks.ts`, `src/lib/mocks/adminMocks.ts`, `src/lib/mocks/attendanceMocks.ts`, `src/lib/mocks/index.ts` for contract-shaped mocks.
- Create: `src/lib/map/arcgisConfig.ts`, `src/lib/map/createSceneView.ts`, `src/lib/map/types.ts` for ArcGIS integration.
- Create: `src/services/apiClientInstance.ts` and service modules under `src/services/*.ts` for real API calls.
- Create: `src/components/ui/*.tsx`, `src/components/page-states/PageState.tsx`, `src/components/map/ArcgisScene.tsx` for shared components.
- Create: `src/routes/routeConfig.tsx`, `src/routes/ProtectedRoute.tsx`, `src/routes/DashboardLayout.tsx` for navigation and role guards.
- Create: `src/features/*` route shell pages for Phase 0 navigation targets.
- Create: test files under `src/**/*.test.ts` and `src/**/*.test.tsx` next to the code they verify.
- Modify: `dev/PROJECT_CHECKLIST.md` only after all verification commands pass, checking Phase 0 items that were actually implemented.

---

### Task 1: Scaffold Vite React TypeScript Tooling

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/global.css`
- Create: `src/vite-env.d.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write root project config files**

Create `package.json` with these scripts and dependencies:

```json
{
  "name": "ama-desktop-dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@arcgis/core": "^4.33.0",
    "@vitejs/plugin-react": "^4.4.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.27.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^22.15.21",
    "@types/react": "^19.1.5",
    "@types/react-dom": "^19.1.5",
    "eslint": "^9.27.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.2.0",
    "jsdom": "^26.1.0",
    "prettier": "^3.5.3",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.32.1",
    "vite": "^6.3.5",
    "vitest": "^3.1.4"
  }
}
```

Create `index.html`:

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AMA Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

Create `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Create `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "eslint.config.js"]
}
```

Create `eslint.config.js`:

```js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
```

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
coverage/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

Create `.env.example`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_ARCGIS_API_KEY=
VITE_ARCGIS_PORTAL_URL=https://www.arcgis.com
VITE_ARCGIS_WEBSCENE_ID=
VITE_ARCGIS_DEFAULT_CENTER_LNG=106.700981
VITE_ARCGIS_DEFAULT_CENTER_LAT=10.776889
VITE_ARCGIS_DEFAULT_ZOOM=17
VITE_APP_MODE=development
```

- [ ] **Step 2: Write initial app files**

Create `src/app/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `src/app/App.tsx`:

```tsx
export function App() {
  return <div className="app-root">AMA Dashboard</div>;
}
```

Create `src/app/global.css`:

```css
:root {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #172033;
  background: #f4f7fb;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 1024px;
  min-height: 100vh;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-root {
  min-height: 100vh;
}
```

Create `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits with code `0`.

- [ ] **Step 4: Verify scaffold**

Run: `npm run typecheck`

Expected: command exits with code `0`.

Run: `npm run lint`

Expected: command exits with code `0`.

Run: `npm run build`

Expected: command exits with code `0` and creates `dist/`.

Manual checkpoint: user may commit scaffold files.

---

### Task 2: Environment Helpers, Contract Types, And Mock Data

**Files:**
- Create: `src/lib/config/env.test.ts`
- Create: `src/lib/config/env.ts`
- Create: `src/types/api.ts`
- Create: `src/lib/mocks/authMocks.ts`
- Create: `src/lib/mocks/dashboardMocks.ts`
- Create: `src/lib/mocks/adminMocks.ts`
- Create: `src/lib/mocks/attendanceMocks.ts`
- Create: `src/lib/mocks/index.ts`

- [ ] **Step 1: Write failing env tests**

Create `src/lib/config/env.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, getArcgisConfig } from './env';

describe('environment helpers', () => {
  it('adds /api/v1 when the base URL is only the backend host', () => {
    expect(getApiBaseUrl('http://localhost:8000')).toBe('http://localhost:8000/api/v1');
  });

  it('does not duplicate /api/v1 when it is already present', () => {
    expect(getApiBaseUrl('http://localhost:8000/api/v1/')).toBe('http://localhost:8000/api/v1');
  });

  it('falls back to localhost when the API base URL is empty', () => {
    expect(getApiBaseUrl('')).toBe('http://localhost:8000/api/v1');
  });

  it('normalizes ArcGIS numeric config', () => {
    const config = getArcgisConfig({
      VITE_ARCGIS_API_KEY: 'key',
      VITE_ARCGIS_PORTAL_URL: 'https://example.portal',
      VITE_ARCGIS_WEBSCENE_ID: 'abc123',
      VITE_ARCGIS_DEFAULT_CENTER_LNG: '106.7',
      VITE_ARCGIS_DEFAULT_CENTER_LAT: '10.77',
      VITE_ARCGIS_DEFAULT_ZOOM: '16',
    });

    expect(config.defaultCenter).toEqual({ longitude: 106.7, latitude: 10.77 });
    expect(config.defaultZoom).toBe(16);
  });
});
```

- [ ] **Step 2: Run env tests to verify failure**

Run: `npm run test -- src/lib/config/env.test.ts`

Expected: FAIL because `src/lib/config/env.ts` does not exist.

- [ ] **Step 3: Implement env helpers**

Create `src/lib/config/env.ts`:

```ts
export interface RawArcgisEnv {
  VITE_ARCGIS_API_KEY?: string;
  VITE_ARCGIS_PORTAL_URL?: string;
  VITE_ARCGIS_WEBSCENE_ID?: string;
  VITE_ARCGIS_DEFAULT_CENTER_LNG?: string;
  VITE_ARCGIS_DEFAULT_CENTER_LAT?: string;
  VITE_ARCGIS_DEFAULT_ZOOM?: string;
}

export interface ArcgisAppConfig {
  apiKey: string;
  portalUrl: string;
  webSceneId: string;
  defaultCenter: {
    longitude: number;
    latitude: number;
  };
  defaultZoom: number;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_PORTAL_URL = 'https://www.arcgis.com';
const DEFAULT_LNG = 106.700981;
const DEFAULT_LAT = 10.776889;
const DEFAULT_ZOOM = 17;

export function getApiBaseUrl(rawBaseUrl = import.meta.env.VITE_API_BASE_URL): string {
  const trimmed = (rawBaseUrl || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getArcgisConfig(env: RawArcgisEnv = import.meta.env): ArcgisAppConfig {
  return {
    apiKey: env.VITE_ARCGIS_API_KEY?.trim() ?? '',
    portalUrl: env.VITE_ARCGIS_PORTAL_URL?.trim() || DEFAULT_PORTAL_URL,
    webSceneId: env.VITE_ARCGIS_WEBSCENE_ID?.trim() ?? '',
    defaultCenter: {
      longitude: parseNumber(env.VITE_ARCGIS_DEFAULT_CENTER_LNG, DEFAULT_LNG),
      latitude: parseNumber(env.VITE_ARCGIS_DEFAULT_CENTER_LAT, DEFAULT_LAT),
    },
    defaultZoom: parseNumber(env.VITE_ARCGIS_DEFAULT_ZOOM, DEFAULT_ZOOM),
  };
}
```

- [ ] **Step 4: Add OpenAPI-shaped types**

Create `src/types/api.ts` with field names matching `dev/openAPI.json`:

```ts
export type AccountRole = 'employee' | 'hr' | 'manager' | 'admin';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type DevicePlatform = 'android' | 'ios' | 'web' | 'other';
export type AuditActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'checkin'
  | 'checkout'
  | 'approve'
  | 'reject';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta | null;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiMeta | null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AccountInfo {
  account_id: number;
  username: string;
  role: AccountRole;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface EmployeeInfo {
  employee_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  department_id: number;
  status: EmployeeStatus;
}

export interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  account: AccountInfo;
  employee: EmployeeInfo;
}

export interface RefreshData {
  access_token: string;
  token_type?: string;
  expires_in: number;
}

export interface MeData {
  account: AccountInfo;
  employee: EmployeeInfo;
}

export interface MessageData {
  message: string;
}

export interface ActiveLocationItem {
  employee_id: number;
  full_name: string;
  department_name: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  building_id: number | null;
  building_name: string | null;
  floor_id: number | null;
  floor_name: string | null;
  last_checkin_at: string;
}

export interface DashboardSummaryData {
  date: string;
  total_employees: number;
  checked_in_today: number;
  on_time_count: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  fraud_alerts_today: number;
  on_time_rate: number;
  active_locations: ActiveLocationItem[];
}

export interface RealtimeLocationItem extends ActiveLocationItem {
  gps_accuracy: number | null;
  checked_in_at: string;
}

export interface BuildingItem {
  building_id: number;
  name: string;
  address: string;
  center_lat: number;
  center_lng: number;
  total_floors: number;
  arcgis_layer_id: string;
  is_active?: boolean;
  floors?: FloorItem[];
}

export interface FloorItem {
  floor_id: number;
  building_id: number;
  floor_number: number;
  floor_name: string;
  altitude_min: number;
  altitude_max: number;
}

export interface GeofenceItem {
  geofence_id: number;
  floor_id: number;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  altitude_min: number;
  altitude_max: number;
  allow_checkin: boolean;
  allow_checkout: boolean;
  is_active: boolean;
}

export interface DepartmentItem {
  department_id: number;
  name: string;
  description?: string | null;
  manager_id?: number | null;
  employee_count?: number;
}

export interface ShiftItem {
  shift_id: number;
  employee_id: number;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance_min: number;
  early_leave_min: number;
  apply_to_weekends: boolean;
}

export interface DeviceItem {
  device_id: number;
  employee_id: number;
  device_fingerprint: string;
  platform: DevicePlatform;
  model?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  is_trusted: boolean;
  registered_at: string;
}

export interface AuditLogItem {
  log_id: number;
  account_id: number;
  action_type: AuditActionType;
  target_entity: string;
  target_id: number | null;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListData {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReportSummary {
  work_days: number;
  total_hours: number;
  late_count: number;
  early_leave_count: number;
  error_count: number;
}

export interface ReportEmployeeSummary {
  employee_id: number;
  full_name: string;
  department_name: string;
  work_days: number;
  total_hours: number;
  late_count: number;
  early_leave_count: number;
}

export interface ReportDayDetail {
  employee_id: number;
  date: string;
  checkin_at: string | null;
  checkout_at: string | null;
  status: string;
  total_hours: number;
}

export interface AttendanceReportData {
  range: Record<string, string>;
  summary: ReportSummary;
  employees: ReportEmployeeSummary[];
  details: ReportDayDetail[];
}
```

- [ ] **Step 5: Add contract-shaped mocks**

Create `src/lib/mocks/authMocks.ts`:

```ts
import type { AccountInfo, EmployeeInfo, LoginData, MeData, RefreshData } from '@/types/api';

export const mockAccounts: Record<string, AccountInfo> = {
  admin: {
    account_id: 1001,
    username: 'linh.tran@example.com',
    role: 'admin',
    is_active: true,
    last_login_at: '2026-05-24T08:00:00Z',
  },
  hr: {
    account_id: 1003,
    username: 'hoa.pham@example.com',
    role: 'hr',
    is_active: true,
    last_login_at: '2026-05-24T08:05:00Z',
  },
  manager: {
    account_id: 1004,
    username: 'quang.le@example.com',
    role: 'manager',
    is_active: true,
    last_login_at: '2026-05-24T08:10:00Z',
  },
  employee: {
    account_id: 1002,
    username: 'minh.nguyen@example.com',
    role: 'employee',
    is_active: true,
    last_login_at: '2026-05-24T08:15:00Z',
  },
};

export const mockEmployees: Record<string, EmployeeInfo> = {
  admin: {
    employee_id: 1,
    full_name: 'Linh Trần',
    email: 'linh.tran@example.com',
    phone: '0901001001',
    position: 'Quản trị hệ thống',
    department_id: 1,
    status: 'active',
  },
  hr: {
    employee_id: 3,
    full_name: 'Hoa Phạm',
    email: 'hoa.pham@example.com',
    phone: '0901001003',
    position: 'Chuyên viên nhân sự',
    department_id: 2,
    status: 'active',
  },
  manager: {
    employee_id: 4,
    full_name: 'Quang Lê',
    email: 'quang.le@example.com',
    phone: '0901001004',
    position: 'Giám đốc điều hành',
    department_id: 1,
    status: 'active',
  },
  employee: {
    employee_id: 2,
    full_name: 'Minh Nguyễn',
    email: 'minh.nguyen@example.com',
    phone: '0901001002',
    position: 'Nhân viên',
    department_id: 3,
    status: 'active',
  },
};

export const mockLoginData: Record<string, LoginData> = Object.fromEntries(
  Object.entries(mockAccounts).map(([key, account]) => [
    key,
    {
      access_token: `mock-access-token-${key}`,
      refresh_token: `mock-refresh-token-${key}`,
      token_type: 'bearer',
      expires_in: 3600,
      account,
      employee: mockEmployees[key],
    },
  ]),
) as Record<string, LoginData>;

export const mockMeData: Record<string, MeData> = Object.fromEntries(
  Object.entries(mockAccounts).map(([key, account]) => [
    key,
    {
      account,
      employee: mockEmployees[key],
    },
  ]),
) as Record<string, MeData>;

export const mockRefreshData: RefreshData = {
  access_token: 'mock-refreshed-access-token',
  token_type: 'bearer',
  expires_in: 3600,
};
```

Create `src/lib/mocks/dashboardMocks.ts`:

```ts
import type { DashboardSummaryData, RealtimeLocationItem } from '@/types/api';

export const mockDashboardSummary: DashboardSummaryData = {
  date: '2026-05-24',
  total_employees: 128,
  checked_in_today: 96,
  on_time_count: 84,
  late_count: 9,
  early_leave_count: 3,
  absent_count: 12,
  fraud_alerts_today: 4,
  on_time_rate: 87.5,
  active_locations: [
    {
      employee_id: 2,
      full_name: 'Minh Nguyễn',
      department_name: 'Kỹ thuật',
      latitude: 10.776889,
      longitude: 106.700981,
      altitude: 18.5,
      building_id: 1,
      building_name: 'Tòa nhà AMA',
      floor_id: 3,
      floor_name: 'Tầng 3',
      last_checkin_at: '2026-05-24T08:01:00Z',
    },
  ],
};

export const mockRealtimeLocations: RealtimeLocationItem[] = [
  {
    ...mockDashboardSummary.active_locations[0],
    gps_accuracy: 6.5,
    checked_in_at: '2026-05-24T08:01:00Z',
  },
];
```

Create `src/lib/mocks/adminMocks.ts`:

```ts
import type { BuildingItem, DepartmentItem, DeviceItem, FloorItem, GeofenceItem, ShiftItem } from '@/types/api';

export const mockFloors: FloorItem[] = [
  {
    floor_id: 3,
    building_id: 1,
    floor_number: 3,
    floor_name: 'Tầng 3',
    altitude_min: 15,
    altitude_max: 22,
  },
];

export const mockBuildings: BuildingItem[] = [
  {
    building_id: 1,
    name: 'Tòa nhà AMA',
    address: 'Quận 1, TP. Hồ Chí Minh',
    center_lat: 10.776889,
    center_lng: 106.700981,
    total_floors: 12,
    arcgis_layer_id: 'ama-building-layer',
    is_active: true,
    floors: mockFloors,
  },
];

export const mockGeofences: GeofenceItem[] = [
  {
    geofence_id: 1,
    floor_id: 3,
    name: 'Vùng chấm công tầng 3',
    center_lat: 10.776889,
    center_lng: 106.700981,
    radius_meters: 45,
    altitude_min: 15,
    altitude_max: 22,
    allow_checkin: true,
    allow_checkout: true,
    is_active: true,
  },
];

export const mockDepartments: DepartmentItem[] = [
  { department_id: 1, name: 'Ban điều hành', description: 'Khối quản lý', manager_id: 4, employee_count: 8 },
  { department_id: 2, name: 'Nhân sự', description: 'Phòng nhân sự', manager_id: 3, employee_count: 12 },
  { department_id: 3, name: 'Kỹ thuật', description: 'Khối kỹ thuật', manager_id: null, employee_count: 54 },
];

export const mockShifts: ShiftItem[] = [
  {
    shift_id: 1,
    employee_id: 2,
    name: 'Ca hành chính',
    start_time: '08:00:00',
    end_time: '17:00:00',
    late_tolerance_min: 10,
    early_leave_min: 10,
    apply_to_weekends: false,
  },
];

export const mockDevices: DeviceItem[] = [
  {
    device_id: 1,
    employee_id: 2,
    device_fingerprint: 'ama-device-fingerprint-001',
    platform: 'android',
    model: 'Pixel 8',
    os_version: 'Android 15',
    app_version: '1.0.0',
    is_trusted: true,
    registered_at: '2026-05-24T07:30:00Z',
  },
];
```

Create `src/lib/mocks/attendanceMocks.ts`:

```ts
import type { AttendanceReportData, AuditLogItem } from '@/types/api';

export const mockAttendanceReport: AttendanceReportData = {
  range: { from: '2026-05-01', to: '2026-05-24' },
  summary: {
    work_days: 18,
    total_hours: 144,
    late_count: 9,
    early_leave_count: 3,
    error_count: 4,
  },
  employees: [
    {
      employee_id: 2,
      full_name: 'Minh Nguyễn',
      department_name: 'Kỹ thuật',
      work_days: 18,
      total_hours: 144,
      late_count: 1,
      early_leave_count: 0,
    },
  ],
  details: [
    {
      employee_id: 2,
      date: '2026-05-24',
      checkin_at: '2026-05-24T08:01:00Z',
      checkout_at: null,
      status: 'approved',
      total_hours: 0,
    },
  ],
};

export const mockAuditLogs: AuditLogItem[] = [
  {
    log_id: 1,
    account_id: 1001,
    action_type: 'login',
    target_entity: 'account',
    target_id: 1001,
    payload: { username: 'linh.tran@example.com' },
    ip_address: '127.0.0.1',
    created_at: '2026-05-24T08:00:00Z',
  },
];
```

Create `src/lib/mocks/index.ts`:

```ts
export * from './adminMocks';
export * from './attendanceMocks';
export * from './authMocks';
export * from './dashboardMocks';
```

- [ ] **Step 6: Verify env and types**

Run: `npm run test -- src/lib/config/env.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit env, types, and mocks.

---

### Task 3: Vietnamese Labels, Error Messages, And Permissions

**Files:**
- Create: `src/lib/i18n/labels.test.ts`
- Create: `src/lib/i18n/labels.ts`
- Create: `src/lib/i18n/errorMessages.test.ts`
- Create: `src/lib/i18n/errorMessages.ts`
- Create: `src/lib/auth/permissions.test.ts`
- Create: `src/lib/auth/permissions.ts`

- [ ] **Step 1: Write failing label and error tests**

Create `src/lib/i18n/labels.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAuditActionLabel, getDevicePlatformLabel, getRoleLabel } from './labels';

describe('Vietnamese labels', () => {
  it('maps supported roles', () => {
    expect(getRoleLabel('admin')).toBe('Quản trị viên');
    expect(getRoleLabel('hr')).toBe('Nhân sự');
    expect(getRoleLabel('manager')).toBe('Quản lý');
    expect(getRoleLabel('employee')).toBe('Nhân viên');
  });

  it('maps device platforms and audit actions', () => {
    expect(getDevicePlatformLabel('android')).toBe('Android');
    expect(getAuditActionLabel('approve')).toBe('Phê duyệt');
  });

  it('uses a safe fallback for unknown values', () => {
    expect(getRoleLabel('owner')).toBe('Không xác định');
  });
});
```

Create `src/lib/i18n/errorMessages.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVietnameseErrorMessage } from './errorMessages';

describe('Vietnamese backend error messages', () => {
  it('maps known backend codes', () => {
    expect(getVietnameseErrorMessage('INVALID_CREDENTIALS')).toBe('Email hoặc mật khẩu không đúng.');
    expect(getVietnameseErrorMessage('FORBIDDEN')).toBe('Bạn không có quyền thực hiện thao tác này.');
  });

  it('includes unknown code for debugging', () => {
    expect(getVietnameseErrorMessage('NEW_BACKEND_CODE')).toBe(
      'Đã xảy ra lỗi. Mã lỗi: NEW_BACKEND_CODE.',
    );
  });
});
```

Create `src/lib/auth/permissions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { canAccessRoute, canPerform, dashboardRoles } from './permissions';

describe('permissions', () => {
  it('allows only management roles into the dashboard', () => {
    expect(dashboardRoles).toEqual(['manager', 'hr', 'admin']);
    expect(canAccessRoute('overview', 'manager')).toBe(true);
    expect(canAccessRoute('overview', 'employee')).toBe(false);
  });

  it('restricts admin-only areas', () => {
    expect(canAccessRoute('auditLogs', 'admin')).toBe(true);
    expect(canAccessRoute('auditLogs', 'hr')).toBe(false);
    expect(canPerform('device:trust', 'admin')).toBe(true);
    expect(canPerform('device:trust', 'hr')).toBe(false);
  });

  it('allows HR and admin operational actions', () => {
    expect(canAccessRoute('map', 'hr')).toBe(true);
    expect(canPerform('report:export', 'hr')).toBe(true);
    expect(canPerform('face:delete', 'hr')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- src/lib/i18n/labels.test.ts src/lib/i18n/errorMessages.test.ts src/lib/auth/permissions.test.ts`

Expected: FAIL because implementation files do not exist.

- [ ] **Step 3: Implement labels**

Create `src/lib/i18n/labels.ts`:

```ts
import type { AccountRole, AuditActionType, DevicePlatform, EmployeeStatus } from '@/types/api';

const UNKNOWN_LABEL = 'Không xác định';

export const roleLabels: Record<AccountRole, string> = {
  employee: 'Nhân viên',
  hr: 'Nhân sự',
  manager: 'Quản lý',
  admin: 'Quản trị viên',
};

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  active: 'Đang làm việc',
  inactive: 'Tạm ngưng',
  on_leave: 'Đang nghỉ phép',
  terminated: 'Đã nghỉ việc',
};

export const devicePlatformLabels: Record<DevicePlatform, string> = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  other: 'Khác',
};

export const auditActionLabels: Record<AuditActionType, string> = {
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  checkin: 'Chấm công vào',
  checkout: 'Chấm công ra',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
};

export const attendanceStatusLabels: Record<string, string> = {
  approved: 'Hợp lệ',
  rejected: 'Bị từ chối',
  pending: 'Chờ xử lý',
  late: 'Đi trễ',
  early_leave: 'Về sớm',
  absent: 'Vắng mặt',
};

export const rejectionReasonLabels: Record<string, string> = {
  outside_geofence: 'Ngoài vùng chấm công',
  untrusted_device: 'Thiết bị chưa tin cậy',
  face_mismatch: 'Khuôn mặt không khớp',
  liveness_failed: 'Không đạt kiểm tra sống',
  mock_location: 'Phát hiện vị trí giả lập',
};

export const notificationTypeLabels: Record<string, string> = {
  attendance_exception: 'Ngoại lệ chấm công',
  fraud_alert: 'Cảnh báo gian lận',
  system: 'Hệ thống',
};

export const exportFormatLabels: Record<string, string> = {
  excel: 'Excel',
  xlsx: 'Excel',
  pdf: 'PDF',
};

function getLabel<T extends string>(labels: Record<string, string>, value: T): string {
  return labels[value] ?? UNKNOWN_LABEL;
}

export function getRoleLabel(value: string): string {
  return getLabel(roleLabels, value);
}

export function getEmployeeStatusLabel(value: string): string {
  return getLabel(employeeStatusLabels, value);
}

export function getDevicePlatformLabel(value: string): string {
  return getLabel(devicePlatformLabels, value);
}

export function getAuditActionLabel(value: string): string {
  return getLabel(auditActionLabels, value);
}
```

- [ ] **Step 4: Implement error messages**

Create `src/lib/i18n/errorMessages.ts`:

```ts
const backendErrorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt.',
  ACCOUNT_INACTIVE: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt.',
  NO_DASHBOARD_PERMISSION: 'Tài khoản này không có quyền truy cập Dashboard.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.',
  NETWORK_ERROR: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.',
  DUPLICATE_EMAIL: 'Email đã tồn tại trong hệ thống.',
  DUPLICATE_PHONE: 'Số điện thoại đã tồn tại trong hệ thống.',
  INVALID_ARCGIS_LAYER: 'Mã lớp bản đồ ArcGIS không hợp lệ.',
  GEOFENCE_OVERLAP: 'Vùng chấm công bị chồng lấn với vùng hiện có.',
};

export function getVietnameseErrorMessage(code: string, fallbackMessage?: string): string {
  if (backendErrorMessages[code]) {
    return backendErrorMessages[code];
  }

  if (fallbackMessage) {
    return fallbackMessage;
  }

  return `Đã xảy ra lỗi. Mã lỗi: ${code}.`;
}
```

- [ ] **Step 5: Implement permissions**

Create `src/lib/auth/permissions.ts`:

```ts
import type { AccountRole } from '@/types/api';

export const dashboardRoles = ['manager', 'hr', 'admin'] as const satisfies AccountRole[];

export type DashboardRouteKey =
  | 'overview'
  | 'map'
  | 'geofences'
  | 'buildings'
  | 'reports'
  | 'exceptions'
  | 'admin'
  | 'adminEmployees'
  | 'adminDepartments'
  | 'adminShifts'
  | 'adminDevices'
  | 'auditLogs';

export type PermissionAction =
  | 'dashboard:view'
  | 'report:export'
  | 'face:write'
  | 'face:delete'
  | 'geofence:write'
  | 'building:write'
  | 'device:trust'
  | 'audit:view';

const routeRoles: Record<DashboardRouteKey, AccountRole[]> = {
  overview: ['manager', 'hr', 'admin'],
  map: ['hr', 'admin'],
  geofences: ['hr', 'admin'],
  buildings: ['hr', 'admin'],
  reports: ['manager', 'hr', 'admin'],
  exceptions: ['hr', 'admin'],
  admin: ['hr', 'admin'],
  adminEmployees: ['hr', 'admin'],
  adminDepartments: ['hr', 'admin'],
  adminShifts: ['hr', 'admin'],
  adminDevices: ['admin'],
  auditLogs: ['admin'],
};

const actionRoles: Record<PermissionAction, AccountRole[]> = {
  'dashboard:view': ['manager', 'hr', 'admin'],
  'report:export': ['hr', 'admin'],
  'face:write': ['hr', 'admin'],
  'face:delete': ['admin'],
  'geofence:write': ['hr', 'admin'],
  'building:write': ['admin'],
  'device:trust': ['admin'],
  'audit:view': ['admin'],
};

export function isDashboardRole(role: AccountRole | undefined): role is (typeof dashboardRoles)[number] {
  return role !== undefined && dashboardRoles.includes(role as (typeof dashboardRoles)[number]);
}

export function canAccessRoute(route: DashboardRouteKey, role: AccountRole | undefined): boolean {
  return role !== undefined && routeRoles[route].includes(role);
}

export function canPerform(action: PermissionAction, role: AccountRole | undefined): boolean {
  return role !== undefined && actionRoles[action].includes(role);
}
```

- [ ] **Step 6: Verify labels, errors, and permissions**

Run: `npm run test -- src/lib/i18n/labels.test.ts src/lib/i18n/errorMessages.test.ts src/lib/auth/permissions.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit labels, errors, and permissions.

---

### Task 4: Token Storage

**Files:**
- Create: `src/lib/api/tokenStorage.test.ts`
- Create: `src/lib/api/tokenStorage.ts`

- [ ] **Step 1: Write failing token storage tests**

Create `src/lib/api/tokenStorage.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createMemoryTokenStorage } from './tokenStorage';

describe('token storage', () => {
  it('stores, reads, and clears tokens', () => {
    const storage = createMemoryTokenStorage();

    storage.setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    expect(storage.getTokens()).toEqual({ accessToken: 'access', refreshToken: 'refresh' });

    storage.clearTokens();
    expect(storage.getTokens()).toBeNull();
  });
});
```

- [ ] **Step 2: Run token storage tests to verify failure**

Run: `npm run test -- src/lib/api/tokenStorage.test.ts`

Expected: FAIL because `src/lib/api/tokenStorage.ts` does not exist.

- [ ] **Step 3: Implement token storage**

Create `src/lib/api/tokenStorage.ts`:

```ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenStorage {
  getTokens(): AuthTokens | null;
  setTokens(tokens: AuthTokens): void;
  updateAccessToken(accessToken: string): void;
  clearTokens(): void;
}

const STORAGE_KEY = 'ama.dashboard.tokens';

export function createMemoryTokenStorage(initialTokens: AuthTokens | null = null): TokenStorage {
  let current = initialTokens;

  return {
    getTokens: () => current,
    setTokens: (tokens) => {
      current = tokens;
    },
    updateAccessToken: (accessToken) => {
      if (current) {
        current = { ...current, accessToken };
      }
    },
    clearTokens: () => {
      current = null;
    },
  };
}

export function createLocalTokenStorage(storage: Storage = window.localStorage): TokenStorage {
  return {
    getTokens: () => {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as AuthTokens;
      } catch {
        storage.removeItem(STORAGE_KEY);
        return null;
      }
    },
    setTokens: (tokens) => {
      storage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    },
    updateAccessToken: (accessToken) => {
      const tokens = createLocalTokenStorage(storage).getTokens();
      if (tokens) {
        storage.setItem(STORAGE_KEY, JSON.stringify({ ...tokens, accessToken }));
      }
    },
    clearTokens: () => {
      storage.removeItem(STORAGE_KEY);
    },
  };
}

export const browserTokenStorage: TokenStorage =
  typeof window === 'undefined' ? createMemoryTokenStorage() : createLocalTokenStorage();
```

- [ ] **Step 4: Verify token storage**

Run: `npm run test -- src/lib/api/tokenStorage.test.ts`

Expected: PASS.

Manual checkpoint: user may commit token storage.

---

### Task 5: API Client Core, Refresh, Multipart, And Downloads

**Files:**
- Create: `src/lib/api/apiClient.test.ts`
- Create: `src/lib/api/apiErrors.ts`
- Create: `src/lib/api/apiClient.ts`

- [ ] **Step 1: Write failing API client tests**

Create `src/lib/api/apiClient.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createMemoryTokenStorage } from './tokenStorage';
import { ApiError, createApiClient } from './apiClient';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });
}

describe('api client', () => {
  it('parses success envelopes and query params', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { ok: true } }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    const result = await client.get<{ ok: boolean }>('/dashboard/summary', {
      query: { date: '2026-05-24', empty: null },
    });

    expect(result.data.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/dashboard/summary?date=2026-05-24',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws Vietnamese API errors for backend failures', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid' } },
        { status: 401 },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    await expect(client.get('/auth/me')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      userMessage: 'Email hoặc mật khẩu không đúng.',
    });
  });

  it('refreshes once on 401 and retries with new access token', async () => {
    const tokenStorage = createMemoryTokenStorage({ accessToken: 'old', refreshToken: 'refresh' });
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: false, error: { code: 'UNAUTHORIZED', message: 'No' } }, { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { access_token: 'new', token_type: 'bearer', expires_in: 3600 } }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { account_id: 1 } }));

    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl, tokenStorage });
    const result = await client.get<{ account_id: number }>('/auth/me');

    expect(result.data.account_id).toBe(1);
    expect(tokenStorage.getTokens()?.accessToken).toBe('new');
  });

  it('supports multipart uploads without forcing JSON headers', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { uploaded: true } }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });
    const formData = new FormData();
    formData.set('face_image', new Blob(['x']), 'face.jpg');

    await client.upload('/employees/1/face', formData);

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(formData);
    expect(new Headers(init.headers).has('Content-Type')).toBe(false);
  });

  it('supports binary downloads', async () => {
    const blob = new Blob(['report']);
    const fetchImpl = vi.fn().mockResolvedValue(new Response(blob, { status: 200 }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    const result = await client.download('/reports/attendance/export', {
      query: { format: 'pdf', from: '2026-05-01', to: '2026-05-24' },
    });

    expect(await result.text()).toBe('report');
  });
});

describe('ApiError', () => {
  it('keeps status, code, and user message', () => {
    const error = new ApiError({ status: 403, code: 'FORBIDDEN', message: 'Forbidden' });
    expect(error.status).toBe(403);
    expect(error.userMessage).toBe('Bạn không có quyền thực hiện thao tác này.');
  });
});
```

- [ ] **Step 2: Run API client tests to verify failure**

Run: `npm run test -- src/lib/api/apiClient.test.ts`

Expected: FAIL because `apiClient.ts` and `apiErrors.ts` do not exist.

- [ ] **Step 3: Implement API errors and client**

Create `src/lib/api/apiErrors.ts`:

```ts
import { getVietnameseErrorMessage } from '@/lib/i18n/errorMessages';

export interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;
  userMessage: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.userMessage = getVietnameseErrorMessage(options.code, options.message);
  }
}
```

Create `src/lib/api/apiClient.ts`:

```ts
import type { ApiFailure, ApiResponse, ApiSuccess, RefreshData } from '@/types/api';
import { getApiBaseUrl } from '@/lib/config/env';
import { ApiError } from './apiErrors';
import { browserTokenStorage, type TokenStorage } from './tokenStorage';

export { ApiError } from './apiErrors';

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue | QueryValue[]>;
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  tokenStorage?: TokenStorage;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  post<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  put<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  delete<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<ApiSuccess<T>>;
  download(path: string, options?: RequestOptions): Promise<Blob>;
}

function appendQuery(url: URL, query?: RequestOptions['query']) {
  if (!query) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== null && item !== undefined && item !== '') {
        url.searchParams.append(key, String(item));
      }
    }
  }
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);
  appendQuery(url, query);
  return url.toString();
}

function isFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.success === false;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? getApiBaseUrl();
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  const tokenStorage = options.tokenStorage ?? browserTokenStorage;

  async function refreshAccessToken(): Promise<boolean> {
    const tokens = tokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      return false;
    }

    const response = await rawRequest<RefreshData>('POST', '/auth/refresh', {
      body: { refresh_token: tokens.refreshToken },
      skipAuth: true,
      skipRefresh: true,
    });

    tokenStorage.updateAccessToken(response.data.access_token);
    return true;
  }

  async function rawRequest<T>(
    method: string,
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<ApiSuccess<T>> {
    const headers = new Headers();
    const tokens = tokenStorage.getTokens();

    if (!requestOptions.skipAuth && tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    let body: BodyInit | undefined;
    if (requestOptions.body instanceof FormData) {
      body = requestOptions.body;
    } else if (requestOptions.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(requestOptions.body);
    }

    const response = await fetchImpl(buildUrl(baseUrl, path, requestOptions.query), {
      method,
      headers,
      body,
      signal: requestOptions.signal,
    });

    const contentType = response.headers.get('Content-Type') ?? '';
    const json = contentType.includes('application/json')
      ? ((await response.json()) as ApiResponse<T>)
      : ({ success: true, data: undefined as T } as ApiSuccess<T>);

    if (response.status === 401 && !requestOptions.skipRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawRequest<T>(method, path, { ...requestOptions, skipRefresh: true });
      }
      tokenStorage.clearTokens();
    }

    if (!response.ok || isFailure(json)) {
      const error = isFailure(json)
        ? json.error
        : { code: response.status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR', message: response.statusText };
      throw new ApiError({
        status: response.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    return json;
  }

  async function download(path: string, requestOptions: RequestOptions = {}): Promise<Blob> {
    const headers = new Headers();
    const tokens = tokenStorage.getTokens();
    if (!requestOptions.skipAuth && tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    const response = await fetchImpl(buildUrl(baseUrl, path, requestOptions.query), {
      method: 'GET',
      headers,
      signal: requestOptions.signal,
    });

    if (!response.ok) {
      throw new ApiError({ status: response.status, code: 'HTTP_ERROR', message: response.statusText });
    }

    return response.blob();
  }

  return {
    get: <T>(path, requestOptions) => rawRequest<T>('GET', path, requestOptions),
    post: <T>(path, requestOptions) => rawRequest<T>('POST', path, requestOptions),
    put: <T>(path, requestOptions) => rawRequest<T>('PUT', path, requestOptions),
    delete: <T>(path, requestOptions) => rawRequest<T>('DELETE', path, requestOptions),
    upload: <T>(path, formData, requestOptions) =>
      rawRequest<T>('POST', path, { ...requestOptions, body: formData }),
    download,
  };
}
```

- [ ] **Step 4: Verify API client**

Run: `npm run test -- src/lib/api/apiClient.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit API client.

---

### Task 6: Real Service Modules With Endpoint Notes

**Files:**
- Create: `src/services/serviceEndpoints.test.ts`
- Create: `src/services/apiClientInstance.ts`
- Create: `src/services/authService.ts`
- Create: `src/services/dashboardService.ts`
- Create: `src/services/realtimeService.ts`
- Create: `src/services/buildingService.ts`
- Create: `src/services/geofenceService.ts`
- Create: `src/services/reportService.ts`
- Create: `src/services/attendanceService.ts`
- Create: `src/services/fraudService.ts`
- Create: `src/services/employeeService.ts`
- Create: `src/services/departmentService.ts`
- Create: `src/services/shiftService.ts`
- Create: `src/services/deviceService.ts`
- Create: `src/services/auditLogService.ts`
- Create: `src/services/notificationService.ts`
- Create: `src/services/index.ts`

- [ ] **Step 1: Write failing endpoint tests**

Create `src/services/serviceEndpoints.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import type { ApiClient } from '@/lib/api/apiClient';
import { authEndpoints, createAuthService } from './authService';
import { buildingEndpoints, createBuildingService } from './buildingService';
import { geofenceEndpoints, createGeofenceService } from './geofenceService';
import { reportEndpoints, createReportService } from './reportService';

function createFakeClient() {
  const calls: string[] = [];
  const response = Promise.resolve({ success: true as const, data: {} });
  const client: ApiClient = {
    get: vi.fn((path: string) => {
      calls.push(`GET ${path}`);
      return response;
    }),
    post: vi.fn((path: string) => {
      calls.push(`POST ${path}`);
      return response;
    }),
    put: vi.fn((path: string) => {
      calls.push(`PUT ${path}`);
      return response;
    }),
    delete: vi.fn((path: string) => {
      calls.push(`DELETE ${path}`);
      return response;
    }),
    upload: vi.fn((path: string) => {
      calls.push(`UPLOAD ${path}`);
      return response;
    }),
    download: vi.fn((path: string) => {
      calls.push(`DOWNLOAD ${path}`);
      return Promise.resolve(new Blob());
    }),
  };

  return { client, calls };
}

describe('service endpoint notes', () => {
  it('documents confirmed endpoints', () => {
    expect(authEndpoints.login).toBe('POST /auth/login');
    expect(buildingEndpoints.list).toBe('GET /buildings/');
    expect(geofenceEndpoints.disable).toBe('DELETE /geofences/{geofence_id}');
    expect(reportEndpoints.exportAttendance).toBe('GET /reports/attendance/export');
  });

  it('calls auth endpoints', async () => {
    const { client, calls } = createFakeClient();
    const authService = createAuthService(client);
    await authService.login({ username: 'linh.tran@example.com', password: 'Admin@2026' });
    await authService.me();
    expect(calls).toEqual(['POST /auth/login', 'GET /auth/me']);
  });

  it('keeps OpenAPI trailing slashes for building and geofence list endpoints', async () => {
    const { client, calls } = createFakeClient();
    await createBuildingService(client).list({ include_floors: true });
    await createGeofenceService(client).list({ is_active: true });
    expect(calls).toEqual(['GET /buildings/', 'GET /geofences/']);
  });

  it('uses binary download for report export', async () => {
    const { client, calls } = createFakeClient();
    await createReportService(client).exportAttendance({ format: 'pdf', from: '2026-05-01', to: '2026-05-24' });
    expect(calls).toEqual(['DOWNLOAD /reports/attendance/export']);
  });
});
```

- [ ] **Step 2: Run service tests to verify failure**

Run: `npm run test -- src/services/serviceEndpoints.test.ts`

Expected: FAIL because service modules do not exist.

- [ ] **Step 3: Implement API client instance and services covered by endpoint tests**

Create `src/services/apiClientInstance.ts`:

```ts
import { createApiClient } from '@/lib/api/apiClient';

export const apiClient = createApiClient();
```

Create `src/services/authService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { LoginData, MeData, MessageData, RefreshData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const authEndpoints = {
  login: 'POST /auth/login',
  refresh: 'POST /auth/refresh',
  me: 'GET /auth/me',
  logout: 'POST /auth/logout',
  changePassword: 'PUT /auth/change-password',
} as const;

export function createAuthService(client: ApiClient = apiClient) {
  return {
    login: (body: LoginRequest) => client.post<LoginData>('/auth/login', { body, skipAuth: true }),
    refresh: (body: RefreshTokenRequest) =>
      client.post<RefreshData>('/auth/refresh', { body, skipAuth: true, skipRefresh: true }),
    me: () => client.get<MeData>('/auth/me'),
    logout: (body?: RefreshTokenRequest) => client.post<MessageData>('/auth/logout', { body }),
    changePassword: (body: ChangePasswordRequest) =>
      client.put<MessageData>('/auth/change-password', { body }),
  };
}

export const authService = createAuthService();
```

Create `src/services/buildingService.ts` with confirmed trailing slash paths:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { BuildingItem, FloorItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const buildingEndpoints = {
  list: 'GET /buildings/',
  create: 'POST /buildings/',
  update: 'PUT /buildings/{building_id}',
  floors: 'GET /buildings/{building_id}/floors',
  createFloor: 'POST /buildings/{building_id}/floors',
  updateFloor: 'PUT /floors/{floor_id}',
} as const;

export interface ListBuildingsParams {
  q?: string;
  include_floors?: boolean;
}

export function createBuildingService(client: ApiClient = apiClient) {
  return {
    list: (query?: ListBuildingsParams) => client.get<BuildingItem[]>('/buildings/', { query }),
    create: (body: Partial<BuildingItem>) => client.post<BuildingItem>('/buildings/', { body }),
    update: (buildingId: number, body: Partial<BuildingItem>) =>
      client.put<BuildingItem>(`/buildings/${buildingId}`, { body }),
    listFloors: (buildingId: number) =>
      client.get<FloorItem[]>(`/buildings/${buildingId}/floors`),
    createFloor: (buildingId: number, body: Partial<FloorItem>) =>
      client.post<FloorItem>(`/buildings/${buildingId}/floors`, { body }),
    updateFloor: (floorId: number, body: Partial<FloorItem>) =>
      client.put<FloorItem>(`/floors/${floorId}`, { body }),
  };
}

export const buildingService = createBuildingService();
```

Create `src/services/geofenceService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { GeofenceItem, MessageData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const geofenceEndpoints = {
  list: 'GET /geofences/',
  create: 'POST /geofences/',
  update: 'PUT /geofences/{geofence_id}',
  disable: 'DELETE /geofences/{geofence_id}',
} as const;

export interface ListGeofencesParams {
  building_id?: number;
  floor_id?: number;
  is_active?: boolean;
}

export function createGeofenceService(client: ApiClient = apiClient) {
  return {
    list: (query?: ListGeofencesParams) => client.get<GeofenceItem[]>('/geofences/', { query }),
    create: (body: Partial<GeofenceItem>) => client.post<GeofenceItem>('/geofences/', { body }),
    update: (geofenceId: number, body: Partial<GeofenceItem>) =>
      client.put<GeofenceItem>(`/geofences/${geofenceId}`, { body }),
    disable: (geofenceId: number) => client.delete<MessageData>(`/geofences/${geofenceId}`),
  };
}

export const geofenceService = createGeofenceService();
```

Create `src/services/reportService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { AttendanceReportData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const reportEndpoints = {
  attendance: 'GET /reports/attendance',
  exportAttendance: 'GET /reports/attendance/export',
} as const;

export interface AttendanceReportParams {
  from: string;
  to: string;
  department_id?: number;
  employee_id?: number;
}

export interface AttendanceExportParams extends AttendanceReportParams {
  format: 'excel' | 'xlsx' | 'pdf';
}

export function createReportService(client: ApiClient = apiClient) {
  return {
    attendance: (query: AttendanceReportParams) =>
      client.get<AttendanceReportData>('/reports/attendance', { query }),
    exportAttendance: (query: AttendanceExportParams) =>
      client.download('/reports/attendance/export', { query }),
  };
}

export const reportService = createReportService();
```

- [ ] **Step 4: Implement additional service modules**

Create `src/services/dashboardService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { DashboardSummaryData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const dashboardEndpoints = { summary: 'GET /dashboard/summary' } as const;

export function createDashboardService(client: ApiClient = apiClient) {
  return {
    summary: (date?: string) => client.get<DashboardSummaryData>('/dashboard/summary', { query: { date } }),
  };
}

export const dashboardService = createDashboardService();
```

Create `src/services/realtimeService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { RealtimeLocationItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const realtimeEndpoints = { locations: 'GET /realtime/employees-location' } as const;

export interface RealtimeLocationParams {
  building_id?: number;
  floor_id?: number;
  department_id?: number;
}

export function createRealtimeService(client: ApiClient = apiClient) {
  return {
    locations: (query?: RealtimeLocationParams) =>
      client.get<RealtimeLocationItem[]>('/realtime/employees-location', { query }),
  };
}

export const realtimeService = createRealtimeService();
```

Create `src/services/attendanceService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import { apiClient } from './apiClientInstance';

export const attendanceEndpoints = {
  exceptions: 'GET /attendance/exceptions',
  detail: 'GET /attendance/{record_id}',
  approve: 'PUT /attendance/{record_id}/approve',
} as const;

export interface AttendanceExceptionParams {
  status?: string;
  reason?: string;
  from?: string;
  to?: string;
  department_id?: number;
  employee_id?: number;
}

export function createAttendanceService(client: ApiClient = apiClient) {
  return {
    exceptions: (query?: AttendanceExceptionParams) =>
      client.get<Record<string, unknown>[]>('/attendance/exceptions', { query }),
    detail: (recordId: number) => client.get<Record<string, unknown>>(`/attendance/${recordId}`),
    approve: (recordId: number, note?: string) =>
      client.put<Record<string, unknown>>(`/attendance/${recordId}/approve`, { body: { note } }),
  };
}

export const attendanceService = createAttendanceService();
```

Create `src/services/fraudService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import { apiClient } from './apiClientInstance';

export const fraudEndpoints = {
  records: 'GET /fraud/records',
  detail: 'GET /fraud/records/{fraud_id}',
} as const;

export function createFraudService(client: ApiClient = apiClient) {
  return {
    records: () => client.get<Record<string, unknown>[]>('/fraud/records'),
    detail: (fraudId: number) => client.get<Record<string, unknown>>(`/fraud/records/${fraudId}`),
  };
}

export const fraudService = createFraudService();
```

Create `src/services/employeeService.ts`:

```ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { EmployeeInfo, MessageData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const employeeEndpoints = {
  list: 'GET /employees',
  create: 'POST /employees',
  detail: 'GET /employees/{employee_id}',
  update: 'PUT /employees/{employee_id}',
  deactivate: 'PUT /employees/{employee_id}/deactivate',
  assignShift: 'PUT /employees/{employee_id}/shift',
  registerFace: 'POST /employees/{employee_id}/face',
  faceStatus: 'GET /employees/{employee_id}/face',
  deleteFace: 'DELETE /employees/{employee_id}/face',
} as const;

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  q?: string;
  department_id?: number;
  status?: string;
}

export function createEmployeeService(client: ApiClient = apiClient) {
  return {
    list: (query?: EmployeeListParams) => client.get<EmployeeInfo[]>('/employees', { query }),
    create: (body: Record<string, unknown>) => client.post<EmployeeInfo>('/employees', { body }),
    detail: (employeeId: number) => client.get<EmployeeInfo>(`/employees/${employeeId}`),
    update: (employeeId: number, body: Record<string, unknown>) =>
      client.put<EmployeeInfo>(`/employees/${employeeId}`, { body }),
    deactivate: (employeeId: number, reason?: string) =>
      client.put<MessageData>(`/employees/${employeeId}/deactivate`, { body: { reason } }),
    assignShift: (employeeId: number, shiftId: number) =>
      client.put<MessageData>(`/employees/${employeeId}/shift`, { body: { shift_id: shiftId } }),
    registerFace: (employeeId: number, formData: FormData) =>
      client.upload<Record<string, unknown>>(`/employees/${employeeId}/face`, formData),
    faceStatus: (employeeId: number) =>
      client.get<Record<string, unknown>>(`/employees/${employeeId}/face`),
    deleteFace: (employeeId: number) =>
      client.delete<Record<string, unknown>>(`/employees/${employeeId}/face`),
  };
}

export const employeeService = createEmployeeService();
```

Create `src/services/departmentService.ts`, `src/services/shiftService.ts`, `src/services/deviceService.ts`, `src/services/auditLogService.ts`, and `src/services/notificationService.ts` using the same factory pattern:

```ts
// departmentService.ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { DepartmentItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const departmentEndpoints = {
  list: 'GET /departments',
  create: 'POST /departments',
  update: 'PUT /departments/{department_id}',
} as const;

export function createDepartmentService(client: ApiClient = apiClient) {
  return {
    list: (query?: { q?: string; page?: number; limit?: number }) =>
      client.get<DepartmentItem[]>('/departments', { query }),
    create: (body: Record<string, unknown>) => client.post<DepartmentItem>('/departments', { body }),
    update: (departmentId: number, body: Record<string, unknown>) =>
      client.put<DepartmentItem>(`/departments/${departmentId}`, { body }),
  };
}

export const departmentService = createDepartmentService();
```

```ts
// shiftService.ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { ShiftItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const shiftEndpoints = {
  list: 'GET /shifts',
  create: 'POST /shifts',
  update: 'PUT /shifts/{shift_id}',
} as const;

export function createShiftService(client: ApiClient = apiClient) {
  return {
    list: (query?: { employee_id?: number }) => client.get<ShiftItem[]>('/shifts', { query }),
    create: (body: Record<string, unknown>) => client.post<ShiftItem>('/shifts', { body }),
    update: (shiftId: number, body: Record<string, unknown>) =>
      client.put<ShiftItem>(`/shifts/${shiftId}`, { body }),
  };
}

export const shiftService = createShiftService();
```

```ts
// deviceService.ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { DeviceItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const deviceEndpoints = {
  list: 'GET /devices',
  trust: 'PUT /devices/{device_id}/trust',
  me: 'GET /devices/me',
} as const;

export function createDeviceService(client: ApiClient = apiClient) {
  return {
    list: (query?: { employee_id?: number; is_trusted?: boolean; platform?: string; page?: number; limit?: number }) =>
      client.get<DeviceItem[]>('/devices', { query }),
    trust: (deviceId: number, isTrusted: boolean) =>
      client.put<DeviceItem>(`/devices/${deviceId}/trust`, { body: { is_trusted: isTrusted } }),
    me: () => client.get<DeviceItem[]>('/devices/me'),
  };
}

export const deviceService = createDeviceService();
```

```ts
// auditLogService.ts
import type { ApiClient } from '@/lib/api/apiClient';
import type { AuditLogItem, AuditLogListData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const auditLogEndpoints = {
  list: 'GET /audit-logs/',
  detail: 'GET /audit-logs/{log_id}',
} as const;

export function createAuditLogService(client: ApiClient = apiClient) {
  return {
    list: (query?: Record<string, string | number | null | undefined>) =>
      client.get<AuditLogListData>('/audit-logs/', { query }),
    detail: (logId: number) => client.get<AuditLogItem>(`/audit-logs/${logId}`),
  };
}

export const auditLogService = createAuditLogService();
```

```ts
// notificationService.ts
import type { ApiClient } from '@/lib/api/apiClient';
import { apiClient } from './apiClientInstance';

export const notificationEndpoints = {
  list: 'GET /notifications',
  markRead: 'PUT /notifications/{notification_id}/read',
  markAllRead: 'PUT /notifications/read-all',
  preferences: 'GET /notifications/preferences',
  updatePreferences: 'PUT /notifications/preferences',
} as const;

export function createNotificationService(client: ApiClient = apiClient) {
  return {
    list: (query?: { is_read?: boolean; type?: string; page?: number; limit?: number }) =>
      client.get<Record<string, unknown>[]>('/notifications', { query }),
    markRead: (notificationId: number) =>
      client.put<Record<string, unknown>>(`/notifications/${notificationId}/read`),
    markAllRead: () => client.put<Record<string, unknown>>('/notifications/read-all'),
    preferences: () => client.get<Record<string, unknown>>('/notifications/preferences'),
    updatePreferences: (body: Record<string, unknown>) =>
      client.put<Record<string, unknown>>('/notifications/preferences', { body }),
  };
}

export const notificationService = createNotificationService();
```

Create `src/services/index.ts`:

```ts
export * from './attendanceService';
export * from './auditLogService';
export * from './authService';
export * from './buildingService';
export * from './dashboardService';
export * from './departmentService';
export * from './deviceService';
export * from './employeeService';
export * from './fraudService';
export * from './geofenceService';
export * from './notificationService';
export * from './realtimeService';
export * from './reportService';
export * from './shiftService';
```

- [ ] **Step 5: Verify services**

Run: `npm run test -- src/services/serviceEndpoints.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit service modules.

---

### Task 7: ArcGIS Foundation

**Files:**
- Create: `src/lib/map/arcgisConfig.test.ts`
- Create: `src/lib/map/arcgisConfig.ts`
- Create: `src/lib/map/types.ts`
- Create: `src/lib/map/createSceneView.ts`
- Create: `src/components/map/ArcgisScene.test.tsx`
- Create: `src/components/map/ArcgisScene.tsx`

- [ ] **Step 1: Write failing ArcGIS config and component tests**

Create `src/lib/map/arcgisConfig.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildArcgisRuntimeConfig } from './arcgisConfig';

describe('ArcGIS runtime config', () => {
  it('keeps portal, API key, and default camera values', () => {
    const config = buildArcgisRuntimeConfig({
      apiKey: 'abc',
      portalUrl: 'https://portal.example',
      webSceneId: 'scene1',
      defaultCenter: { longitude: 106.7, latitude: 10.77 },
      defaultZoom: 17,
    });

    expect(config.portalUrl).toBe('https://portal.example');
    expect(config.defaultCenter.longitude).toBe(106.7);
  });
});
```

Create `src/components/map/ArcgisScene.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArcgisScene } from './ArcgisScene';

vi.mock('@/lib/map/createSceneView', () => ({
  createSceneView: vi.fn(() => Promise.resolve({ destroy: vi.fn() })),
}));

describe('ArcgisScene', () => {
  it('renders a labelled map region', () => {
    render(<ArcgisScene title="Bản đồ 3D" />);
    expect(screen.getByRole('region', { name: 'Bản đồ 3D' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run ArcGIS tests to verify failure**

Run: `npm run test -- src/lib/map/arcgisConfig.test.ts src/components/map/ArcgisScene.test.tsx`

Expected: FAIL because map modules do not exist.

- [ ] **Step 3: Implement ArcGIS config and app-level map types**

Create `src/lib/map/types.ts`:

```ts
export interface MapPoint {
  id: string;
  longitude: number;
  latitude: number;
  altitude?: number | null;
  title: string;
  description?: string;
}

export interface ArcgisSceneHandle {
  destroy(): void;
}
```

Create `src/lib/map/arcgisConfig.ts`:

```ts
import { getArcgisConfig, type ArcgisAppConfig } from '@/lib/config/env';

export interface ArcgisRuntimeConfig extends ArcgisAppConfig {}

export function buildArcgisRuntimeConfig(config: ArcgisAppConfig = getArcgisConfig()): ArcgisRuntimeConfig {
  return config;
}
```

- [ ] **Step 4: Implement SceneView factory**

Create `src/lib/map/createSceneView.ts`:

```ts
import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Map from '@arcgis/core/Map';
import WebScene from '@arcgis/core/WebScene';
import SceneView from '@arcgis/core/views/SceneView';
import type { ArcgisRuntimeConfig } from './arcgisConfig';
import type { ArcgisSceneHandle, MapPoint } from './types';

export interface CreateSceneViewOptions {
  container: HTMLDivElement;
  config: ArcgisRuntimeConfig;
  points?: MapPoint[];
}

export async function createSceneView({
  container,
  config,
  points = [],
}: CreateSceneViewOptions): Promise<ArcgisSceneHandle> {
  if (config.apiKey) {
    esriConfig.apiKey = config.apiKey;
  }

  const graphicsLayer = new GraphicsLayer({ title: 'Nhân viên đang làm việc' });
  graphicsLayer.addMany(
    points.map(
      (point) =>
        new Graphic({
          geometry: new Point({
            longitude: point.longitude,
            latitude: point.latitude,
            z: point.altitude ?? 0,
          }),
          attributes: point,
          popupTemplate: {
            title: point.title,
            content: point.description ?? '',
          },
        }),
    ),
  );

  const map = config.webSceneId
    ? new WebScene({ portalItem: { id: config.webSceneId } })
    : new Map({ basemap: 'arcgis/navigation', ground: 'world-elevation' });

  map.add(graphicsLayer);

  const view = new SceneView({
    container,
    map,
    camera: {
      position: {
        longitude: config.defaultCenter.longitude,
        latitude: config.defaultCenter.latitude,
        z: 800,
      },
      tilt: 65,
    },
    zoom: config.defaultZoom,
  });

  await view.when();

  return {
    destroy: () => view.destroy(),
  };
}
```

- [ ] **Step 5: Implement React ArcGIS component**

Create `src/components/map/ArcgisScene.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { buildArcgisRuntimeConfig } from '@/lib/map/arcgisConfig';
import { createSceneView } from '@/lib/map/createSceneView';
import type { ArcgisSceneHandle, MapPoint } from '@/lib/map/types';

interface ArcgisSceneProps {
  title: string;
  points?: MapPoint[];
  className?: string;
}

export function ArcgisScene({ title, points = [], className }: ArcgisSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ArcgisSceneHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function mountScene() {
      if (!containerRef.current) {
        return;
      }

      try {
        handleRef.current = await createSceneView({
          container: containerRef.current,
          config: buildArcgisRuntimeConfig(),
          points,
        });
      } catch {
        if (!cancelled) {
          setError('Không thể tải bản đồ ArcGIS. Vui lòng kiểm tra cấu hình bản đồ.');
        }
      }
    }

    void mountScene();

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [points]);

  return (
    <section className={className} aria-label={title} role="region">
      {error ? <p role="alert">{error}</p> : null}
      <div ref={containerRef} className="arcgis-scene" />
    </section>
  );
}
```

Add `.arcgis-scene` styles to `src/app/global.css`:

```css
.arcgis-scene {
  min-height: 420px;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
}
```

- [ ] **Step 6: Verify ArcGIS foundation**

Run: `npm run test -- src/lib/map/arcgisConfig.test.ts src/components/map/ArcgisScene.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS and includes ArcGIS package in Vite bundle output.

Manual checkpoint: user may commit ArcGIS foundation.

---

### Task 8: Vietnamese UI Primitives And Page States

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Select.tsx`
- Create: `src/components/ui/DatePicker.tsx`
- Create: `src/components/ui/Table.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Drawer.tsx`
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/index.ts`
- Create: `src/components/page-states/PageState.tsx`
- Create: `src/components/page-states/PageState.test.tsx`
- Create: `src/components/ui/Button.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders Vietnamese accessible label and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Lưu thay đổi</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

Create `src/components/page-states/PageState.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ForbiddenState, LoadingState, NotFoundState } from './PageState';

describe('page states', () => {
  it('renders Vietnamese loading, forbidden, and not found messages', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();

    rerender(<ForbiddenState />);
    expect(screen.getByText('Bạn không có quyền truy cập nội dung này.')).toBeInTheDocument();

    rerender(<NotFoundState />);
    expect(screen.getByText('Không tìm thấy trang.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run UI tests to verify failure**

Run: `npm run test -- src/components/ui/Button.test.tsx src/components/page-states/PageState.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement Button and page states**

Create `src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`ui-button ui-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
```

Create `src/components/page-states/PageState.tsx`:

```tsx
interface PageStateProps {
  title: string;
  description?: string;
}

export function PageState({ title, description }: PageStateProps) {
  return (
    <section className="page-state" aria-live="polite">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  );
}

export function LoadingState() {
  return <PageState title="Đang tải dữ liệu..." />;
}

export function EmptyState() {
  return <PageState title="Chưa có dữ liệu" description="Dữ liệu sẽ hiển thị tại đây khi có bản ghi phù hợp." />;
}

export function ErrorState() {
  return <PageState title="Không thể tải dữ liệu" description="Vui lòng thử lại sau." />;
}

export function ForbiddenState() {
  return <PageState title="Bạn không có quyền truy cập nội dung này." />;
}

export function NotFoundState() {
  return <PageState title="Không tìm thấy trang." />;
}
```

- [ ] **Step 4: Implement additional UI primitives**

Create `src/components/ui/Input.tsx`:

```tsx
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} aria-invalid={error ? true : undefined} {...props} />
      {helperText ? <small>{helperText}</small> : null}
      {error ? <small role="alert">{error}</small> : null}
    </label>
  );
}
```

Create `src/components/ui/Select.tsx`:

```tsx
import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
}

export function Select({ label, options, id, className = '', ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={selectId}>
      <span>{label}</span>
      <select id={selectId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

Create `src/components/ui/DatePicker.tsx`:

```tsx
import { Input } from './Input';
import type { InputHTMLAttributes } from 'react';

export function DatePicker(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return <Input type="date" {...props} />;
}
```

Create `src/components/ui/Table.tsx`:

```tsx
import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render(row: T): ReactNode;
}

interface TableProps<T> {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey(row: T): string | number;
}

export function Table<T>({ caption, columns, rows, getRowKey }: TableProps<T>) {
  return (
    <table className="ui-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Create `src/components/ui/Badge.tsx`:

```tsx
import type { ReactNode } from 'react';

export function Badge({ children }: { children: ReactNode }) {
  return <span className="ui-badge">{children}</span>;
}
```

Create `src/components/ui/Card.tsx`:

```tsx
import type { ReactNode } from 'react';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="ui-card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
```

Create `src/components/ui/Modal.tsx`, `src/components/ui/Drawer.tsx`, `src/components/ui/Tabs.tsx`, and `src/components/ui/Toast.tsx`:

```tsx
// Modal.tsx
import type { ReactNode } from 'react';
import { Button } from './Button';

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose(): void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="ui-backdrop" role="presentation">
      <section className="ui-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><Button variant="ghost" onClick={onClose}>Đóng</Button></header>
        {children}
      </section>
    </div>
  );
}
```

```tsx
// Drawer.tsx
import type { ReactNode } from 'react';

export function Drawer({ title, open, children }: { title: string; open: boolean; children: ReactNode }) {
  return open ? <aside className="ui-drawer" aria-label={title}>{children}</aside> : null;
}
```

```tsx
// Tabs.tsx
export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({ tabs, activeId, onChange }: { tabs: TabItem[]; activeId: string; onChange(id: string): void }) {
  return (
    <div className="ui-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} role="tab" aria-selected={tab.id === activeId} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// Toast.tsx
export function Toast({ message, tone = 'info' }: { message: string; tone?: 'info' | 'success' | 'error' }) {
  return <div className={`ui-toast ui-toast--${tone}`} role="status">{message}</div>;
}
```

Create `src/components/ui/index.ts`:

```ts
export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { DatePicker } from './DatePicker';
export { Drawer } from './Drawer';
export { Input } from './Input';
export { Modal } from './Modal';
export { Select } from './Select';
export { Table } from './Table';
export { Tabs } from './Tabs';
export { Toast } from './Toast';
```

- [ ] **Step 5: Add UI styles**

Append to `src/app/global.css`:

```css
.ui-button {
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
}

.ui-button--primary {
  background: #155eef;
  color: #ffffff;
}

.ui-button--secondary {
  background: #e8eefb;
  color: #172033;
}

.ui-button--danger {
  background: #d92d20;
  color: #ffffff;
}

.ui-button--ghost {
  background: transparent;
  color: #155eef;
}

.page-state {
  display: grid;
  min-height: 240px;
  place-items: center;
  text-align: center;
}
```

- [ ] **Step 6: Verify UI foundation**

Run: `npm run test -- src/components/ui/Button.test.tsx src/components/page-states/PageState.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit UI primitives.

---

### Task 9: Auth Session, Protected Routes, And Dashboard Layout

**Files:**
- Create: `src/lib/auth/session.tsx`
- Create: `src/routes/ProtectedRoute.test.tsx`
- Create: `src/routes/ProtectedRoute.tsx`
- Create: `src/routes/DashboardLayout.tsx`
- Create: `src/routes/routeConfig.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Create: `src/features/overview/OverviewPage.tsx`
- Create: `src/features/map/MapPage.tsx`
- Create: `src/features/geofences/GeofencePage.tsx`
- Create: `src/features/geofences/BuildingsPage.tsx`
- Create: `src/features/reports/ReportsPage.tsx`
- Create: `src/features/exceptions/ExceptionsPage.tsx`
- Create: `src/features/admin/AdminPage.tsx`
- Create: `src/features/admin/AdminEmployeesPage.tsx`
- Create: `src/features/admin/AdminDepartmentsPage.tsx`
- Create: `src/features/admin/AdminShiftsPage.tsx`
- Create: `src/features/admin/AdminDevicesPage.tsx`
- Create: `src/features/audit/AuditLogsPage.tsx`
- Modify: `src/app/App.tsx`

- [ ] **Step 1: Write failing protected route tests**

Create `src/routes/ProtectedRoute.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SessionProvider } from '@/lib/auth/session';
import { ProtectedRoute } from './ProtectedRoute';

function renderProtected(role: 'employee' | 'hr' | 'manager' | 'admin' | null) {
  render(
    <SessionProvider initialRole={role}>
      <MemoryRouter initialEntries={["/audit-logs"]}>
        <Routes>
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute routeKey="auditLogs">
                <div>Nhật ký hệ thống</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects anonymous users to login', () => {
    renderProtected(null);
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
  });

  it('shows forbidden state for a management role without route permission', () => {
    renderProtected('hr');
    expect(screen.getByText('Bạn không có quyền truy cập nội dung này.')).toBeInTheDocument();
  });

  it('allows an admin into audit logs', () => {
    renderProtected('admin');
    expect(screen.getByText('Nhật ký hệ thống')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run protected route tests to verify failure**

Run: `npm run test -- src/routes/ProtectedRoute.test.tsx`

Expected: FAIL because session and route guard files do not exist.

- [ ] **Step 3: Implement auth session**

Create `src/lib/auth/session.tsx`:

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AccountRole, MeData } from '@/types/api';

interface SessionContextValue {
  role: AccountRole | null;
  user: MeData | null;
  setSession(user: MeData | null): void;
  clearSession(): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
  initialRole?: AccountRole | null;
}

export function SessionProvider({ children, initialRole = null }: SessionProviderProps) {
  const [user, setUser] = useState<MeData | null>(null);
  const [role, setRole] = useState<AccountRole | null>(initialRole);

  const value = useMemo<SessionContextValue>(
    () => ({
      role,
      user,
      setSession: (nextUser) => {
        setUser(nextUser);
        setRole(nextUser?.account.role ?? null);
      },
      clearSession: () => {
        setUser(null);
        setRole(null);
      },
    }),
    [role, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return context;
}
```

- [ ] **Step 4: Implement route guard and layout**

Create `src/routes/ProtectedRoute.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/lib/auth/session';
import { canAccessRoute, isDashboardRole, type DashboardRouteKey } from '@/lib/auth/permissions';
import { ForbiddenState } from '@/components/page-states/PageState';

interface ProtectedRouteProps {
  routeKey: DashboardRouteKey;
  children: ReactNode;
}

export function ProtectedRoute({ routeKey, children }: ProtectedRouteProps) {
  const { role } = useSession();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!isDashboardRole(role) || !canAccessRoute(routeKey, role)) {
    return <ForbiddenState />;
  }

  return children;
}
```

Create `src/routes/DashboardLayout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/lib/auth/session';

const navItems = [
  { to: '/overview', label: 'Tổng quan' },
  { to: '/map', label: 'Bản đồ 3D' },
  { to: '/geofences', label: 'Vùng chấm công' },
  { to: '/reports', label: 'Báo cáo' },
  { to: '/exceptions', label: 'Ngoại lệ' },
  { to: '/admin', label: 'Quản trị' },
  { to: '/audit-logs', label: 'Nhật ký' },
];

export function DashboardLayout() {
  const { role, clearSession } = useSession();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" aria-label="Điều hướng Dashboard">
        <strong>AMA Dashboard</strong>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <span>Trạng thái: sẵn sàng</span>
          <span>Vai trò: {role ?? 'Chưa đăng nhập'}</span>
          <Button variant="ghost" onClick={clearSession}>Đăng xuất</Button>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement route shells and app router**

Create `src/features/auth/LoginPage.tsx`:

```tsx
export function LoginPage() {
  return <h1>Đăng nhập Dashboard</h1>;
}
```

Create `src/features/overview/OverviewPage.tsx`:

```tsx
export function OverviewPage() {
  return <h1>Tổng quan</h1>;
}
```

Create these screen shell files with the same pattern:

```tsx
// src/features/map/MapPage.tsx
export function MapPage() {
  return <h1>Bản đồ 3D</h1>;
}
```

```tsx
// src/features/geofences/GeofencePage.tsx
export function GeofencePage() {
  return <h1>Vùng chấm công</h1>;
}
```

```tsx
// src/features/geofences/BuildingsPage.tsx
export function BuildingsPage() {
  return <h1>Tòa nhà và tầng</h1>;
}
```

```tsx
// src/features/reports/ReportsPage.tsx
export function ReportsPage() {
  return <h1>Báo cáo chấm công</h1>;
}
```

```tsx
// src/features/exceptions/ExceptionsPage.tsx
export function ExceptionsPage() {
  return <h1>Ngoại lệ và cảnh báo</h1>;
}
```

```tsx
// src/features/admin/AdminPage.tsx
export function AdminPage() {
  return <h1>Quản trị hệ thống</h1>;
}
```

```tsx
// src/features/admin/AdminEmployeesPage.tsx
export function AdminEmployeesPage() {
  return <h1>Quản trị nhân viên</h1>;
}
```

```tsx
// src/features/admin/AdminDepartmentsPage.tsx
export function AdminDepartmentsPage() {
  return <h1>Quản trị phòng ban</h1>;
}
```

```tsx
// src/features/admin/AdminShiftsPage.tsx
export function AdminShiftsPage() {
  return <h1>Quản trị ca làm việc</h1>;
}
```

```tsx
// src/features/admin/AdminDevicesPage.tsx
export function AdminDevicesPage() {
  return <h1>Quản trị thiết bị tin cậy</h1>;
}
```

```tsx
// src/features/audit/AuditLogsPage.tsx
export function AuditLogsPage() {
  return <h1>Tra cứu nhật ký hệ thống</h1>;
}
```

Create `src/routes/routeConfig.tsx`:

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { AdminDepartmentsPage } from '@/features/admin/AdminDepartmentsPage';
import { AdminDevicesPage } from '@/features/admin/AdminDevicesPage';
import { AdminEmployeesPage } from '@/features/admin/AdminEmployeesPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { AdminShiftsPage } from '@/features/admin/AdminShiftsPage';
import { AuditLogsPage } from '@/features/audit/AuditLogsPage';
import { ExceptionsPage } from '@/features/exceptions/ExceptionsPage';
import { BuildingsPage } from '@/features/geofences/BuildingsPage';
import { GeofencePage } from '@/features/geofences/GeofencePage';
import { MapPage } from '@/features/map/MapPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { NotFoundState } from '@/components/page-states/PageState';
import { DashboardLayout } from './DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/overview" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/overview', element: <ProtectedRoute routeKey="overview"><OverviewPage /></ProtectedRoute> },
      { path: '/map', element: <ProtectedRoute routeKey="map"><MapPage /></ProtectedRoute> },
      { path: '/geofences', element: <ProtectedRoute routeKey="geofences"><GeofencePage /></ProtectedRoute> },
      { path: '/geofences/buildings', element: <ProtectedRoute routeKey="buildings"><BuildingsPage /></ProtectedRoute> },
      { path: '/reports', element: <ProtectedRoute routeKey="reports"><ReportsPage /></ProtectedRoute> },
      { path: '/exceptions', element: <ProtectedRoute routeKey="exceptions"><ExceptionsPage /></ProtectedRoute> },
      { path: '/admin', element: <ProtectedRoute routeKey="admin"><AdminPage /></ProtectedRoute> },
      { path: '/admin/employees', element: <ProtectedRoute routeKey="adminEmployees"><AdminEmployeesPage /></ProtectedRoute> },
      { path: '/admin/departments', element: <ProtectedRoute routeKey="adminDepartments"><AdminDepartmentsPage /></ProtectedRoute> },
      { path: '/admin/shifts', element: <ProtectedRoute routeKey="adminShifts"><AdminShiftsPage /></ProtectedRoute> },
      { path: '/admin/devices', element: <ProtectedRoute routeKey="adminDevices"><AdminDevicesPage /></ProtectedRoute> },
      { path: '/audit-logs', element: <ProtectedRoute routeKey="auditLogs"><AuditLogsPage /></ProtectedRoute> },
    ],
  },
  { path: '*', element: <NotFoundState /> },
]);
```

Modify `src/app/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom';
import { SessionProvider } from '@/lib/auth/session';
import { router } from '@/routes/routeConfig';

export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
```

- [ ] **Step 6: Verify routing foundation**

Run: `npm run test -- src/routes/ProtectedRoute.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit routing and layout.

---

### Task 10: Login Shell And Auth Service Integration

**Files:**
- Create: `src/features/auth/LoginPage.test.tsx`
- Modify: `src/features/auth/LoginPage.tsx`
- Modify: `src/lib/auth/session.tsx`

- [ ] **Step 1: Write failing login behavior test**

Create `src/features/auth/LoginPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('shows a Vietnamese no-permission error for employee accounts', async () => {
    render(
      <MemoryRouter>
        <LoginPage
          login={vi.fn().mockResolvedValue({
            success: true,
            data: {
              access_token: 'a',
              refresh_token: 'r',
              expires_in: 3600,
              account: { account_id: 1, username: 'employee@example.com', role: 'employee', is_active: true },
              employee: {
                employee_id: 1,
                full_name: 'Nhân viên',
                email: 'employee@example.com',
                department_id: 1,
                status: 'active',
              },
            },
          })}
        />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText('Email công ty'), 'employee@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'Employee@2026');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(await screen.findByText('Tài khoản này không có quyền truy cập Dashboard.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run login test to verify failure**

Run: `npm run test -- src/features/auth/LoginPage.test.tsx`

Expected: FAIL because `LoginPage` does not accept the injected `login` function.

- [ ] **Step 3: Implement login shell**

Replace `src/features/auth/LoginPage.tsx` with this implementation:

```tsx
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { browserTokenStorage } from '@/lib/api/tokenStorage';
import { isDashboardRole } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { authService, type LoginRequest } from '@/services/authService';
import type { ApiSuccess, LoginData } from '@/types/api';

interface LoginPageProps {
  login?: (body: LoginRequest) => Promise<ApiSuccess<LoginData>>;
}

export function LoginPage({ login = authService.login }: LoginPageProps) {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await login({ username, password });
      const { account, employee, access_token, refresh_token } = response.data;

      if (!isDashboardRole(account.role)) {
        browserTokenStorage.clearTokens();
        setError('Tài khoản này không có quyền truy cập Dashboard.');
        return;
      }

      browserTokenStorage.setTokens({ accessToken: access_token, refreshToken: refresh_token });
      setSession({ account, employee });
      navigate('/overview', { replace: true });
    } catch {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Đăng nhập Dashboard</h1>
        <label>
          Email công ty
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={submitting}>
          Đăng nhập
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Verify login shell**

Run: `npm run test -- src/features/auth/LoginPage.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Manual checkpoint: user may commit login shell.

---

### Task 11: Final Verification And Checklist Update

**Files:**
- Modify: `dev/PROJECT_CHECKLIST.md`

- [ ] **Step 1: Run full verification**

Run: `npm run lint`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 2: Update Phase 0 checklist**

In `dev/PROJECT_CHECKLIST.md`, change every Phase 0 checklist item from line 9 through line 33 from `[ ]` to `[x]` after the four verification commands above pass.

- [ ] **Step 3: Inspect final diff**

Run: `git status --short`

Expected: shows only intended Phase 0 app files, plan/spec docs, package files, and checklist changes.

Run: `git diff --stat`

Expected: summary matches the created foundation files.

Manual checkpoint: user may commit completed Phase 0 foundation.
