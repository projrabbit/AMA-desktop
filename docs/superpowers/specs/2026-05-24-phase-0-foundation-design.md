# Phase 0 Foundation Design

## Context

This repository is the React + TypeScript desktop dashboard for AMA Smart Attendance. The current root contains project documentation under `dev/` and no application scaffold yet. Phase 0 creates the shared foundation that later dashboard screens will reuse.

The dashboard serves management users only: `manager`, `hr`, and `admin`. Employee mobile flows are out of scope for this repository, except where API contracts expose employee-only endpoints that dashboard screens must intentionally hide.

All visible UI copy in the application must be Vietnamese.

## Confirmed Decisions

- Source of truth for API contract: `dev/openAPI.json`.
- Supporting API docs: `dev/FULL_API_DOCS.md` for authorization notes and discrepancy reconciliation; `dev/SWAGGER_MANUAL_TEST_DATA.md` for seeded account examples and manual QA payload examples.
- API server status during frontend implementation: treat the API as if it is running, but do not require live API connectivity to build Phase 0.
- Service layer: write real services that call the documented API endpoints. Do not replace services with mock-only implementations.
- Mock data: create contract-shaped mock data for development and tests where screens or components need data before the backend is running.
- ArcGIS: required in the project from the foundation phase. Do not defer real map integration.
- Map implementation boundary: isolate ArcGIS setup in shared map modules so page logic does not import ArcGIS directly.
- Role access: allow `manager`, `hr`, and `admin` into the dashboard. Block or redirect `employee` from desktop dashboard routes.
- Routing scope: dashboard-only web app with public login and protected dashboard shell.

## API Discrepancy Decisions

Use the exact paths from `dev/openAPI.json` where docs disagree.

- Device self endpoint: `GET /api/v1/devices/me`.
- Shift assignment endpoint: `PUT /api/v1/employees/{employee_id}/shift`.
- Face management endpoints: `POST /api/v1/employees/{employee_id}/face`, `GET /api/v1/employees/{employee_id}/face`, `DELETE /api/v1/employees/{employee_id}/face`.
- Geofence disable endpoint: `DELETE /api/v1/geofences/{geofence_id}`.
- Trailing slash paths: keep trailing slashes for `/api/v1/buildings/`, `/api/v1/geofences/`, and `/api/v1/audit-logs/` because OpenAPI declares them that way.
- Binary export endpoint: `GET /api/v1/reports/attendance/export`, treated as a binary download even though OpenAPI currently has an empty JSON response schema.

## Permission Matrix

Phase 0 will encode route and action permission helpers based on `dev/FULL_API_DOCS.md`.

- Dashboard access: `manager`, `hr`, `admin`.
- Overview and attendance reports: `manager`, `hr`, `admin`.
- Realtime 3D map: `hr`, `admin`.
- Attendance report export: `hr`, `admin`.
- Attendance exceptions and fraud review: `hr`, `admin`.
- Employee, department, and shift management: `hr`, `admin`.
- Device management and audit logs: `admin`.
- Face registration/status: `hr`, `admin`; face delete/reset: `admin`.
- Building writes and floor writes: `admin`.
- Building reads, floor reads, and geofence management: `hr`, `admin`.

Screens should hide unavailable actions when there is no value in showing them, or disable them with clear Vietnamese explanation when the user benefits from seeing why access is unavailable.

## Application Architecture

Create a Vite React + TypeScript app at the repository root.

Required top-level structure:

```text
src/
  app/
  routes/
  features/
  components/
  lib/
  services/
  types/
```

Main responsibilities:

- `src/app`: app bootstrap, providers, router registration, global styles.
- `src/routes`: route objects, guards, layout route wrappers, and lightweight route shells for future screen phases.
- `src/features`: screen-specific feature folders as screens are implemented.
- `src/components`: shared Vietnamese UI primitives and page states.
- `src/lib`: low-level utilities such as API client, token storage, permissions, formatting, ArcGIS helpers, and mock helpers.
- `src/services`: endpoint-focused service modules that call the real API client.
- `src/types`: shared TypeScript types derived from the OpenAPI contract shape.

## Tooling

Phase 0 will add these scripts:

- `dev`: run the Vite dev server.
- `build`: production TypeScript build and Vite build.
- `preview`: preview production build.
- `lint`: run ESLint.
- `typecheck`: run TypeScript without emitting.
- `test`: run unit/component tests.

TypeScript should run in strict mode. Path aliases should use `@/` for `src/`. ESLint and Prettier should be configured for React + TypeScript.

## Environment Variables

Required environment keys:

- `VITE_API_BASE_URL`: backend API host, for example `http://localhost:8000` or `http://localhost:8000/api/v1`.
- `VITE_ARCGIS_API_KEY`: ArcGIS API key when required by the configured portal/layers.
- `VITE_ARCGIS_PORTAL_URL`: optional ArcGIS portal URL.
- `VITE_ARCGIS_WEBSCENE_ID`: optional WebScene item id for scene initialization.
- `VITE_ARCGIS_DEFAULT_CENTER_LNG`: default map center longitude.
- `VITE_ARCGIS_DEFAULT_CENTER_LAT`: default map center latitude.
- `VITE_ARCGIS_DEFAULT_ZOOM`: default map zoom.
- `VITE_APP_MODE`: frontend build mode label used by UI diagnostics.

The API client will normalize `VITE_API_BASE_URL` so callers use paths like `/auth/login` while requests go to `/api/v1/auth/login` exactly once.

## API Client Design

The API client must support:

- Standard response shape `{ success, data, meta, error }`.
- JSON request and response bodies.
- Query parameters, including arrays and optional values.
- Pagination metadata from `meta` and endpoint-specific list data shapes.
- Multipart uploads for face image endpoints.
- Binary downloads for report export.
- Access token injection with `Authorization: Bearer <token>`.
- Refresh token flow on `401`.
- Logout and token clearing when refresh fails.
- Vietnamese error mapping for known backend error codes.

The client should expose a small set of primitives such as `apiClient.get`, `post`, `put`, `delete`, `upload`, and `download`. Services own endpoint names and typed request/response shapes.

## Auth Flow

Login uses `POST /api/v1/auth/login` with `{ username, password }`. The response contains access token, refresh token, account, and employee profile.

After login, the app will call `GET /api/v1/auth/me` or use the login payload to validate role, then fetch `me` to normalize session state. If the account role is `employee`, the app clears tokens and shows a Vietnamese no-dashboard-permission error.

Refresh uses `POST /api/v1/auth/refresh` with `{ refresh_token }`. Logout uses `POST /api/v1/auth/logout` with the stored refresh token when available, then clears local token/session state regardless of API result.

Token storage can use `localStorage` for Phase 0 because there is no existing app policy in this repository. Store tokens behind a small `tokenStorage` module so the storage strategy can change later without changing services.

## Service Modules And Endpoint Notes

Phase 0 will create real service modules even if screens are not fully implemented yet. Each module should include endpoint notes in code comments or exported metadata so later screens can see which OpenAPI path is used.

Initial service modules:

- `authService`: `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`, `PUT /auth/change-password`.
- `dashboardService`: `GET /dashboard/summary`.
- `realtimeService`: `GET /realtime/employees-location`.
- `buildingService`: `GET /buildings/`, `POST /buildings/`, `PUT /buildings/{building_id}`, `GET /buildings/{building_id}/floors`, `POST /buildings/{building_id}/floors`, `PUT /floors/{floor_id}`.
- `geofenceService`: `GET /geofences/`, `POST /geofences/`, `PUT /geofences/{geofence_id}`, `DELETE /geofences/{geofence_id}`.
- `reportService`: `GET /reports/attendance`, `GET /reports/attendance/export`.
- `attendanceService`: `GET /attendance/exceptions`, `GET /attendance/{record_id}`, `PUT /attendance/{record_id}/approve`.
- `fraudService`: `GET /fraud/records`, `GET /fraud/records/{fraud_id}`.
- `employeeService`: `GET /employees`, `POST /employees`, `GET /employees/{employee_id}`, `PUT /employees/{employee_id}`, `PUT /employees/{employee_id}/deactivate`, `PUT /employees/{employee_id}/shift`, face endpoints.
- `departmentService`: `GET /departments`, `POST /departments`, `PUT /departments/{department_id}`.
- `shiftService`: `GET /shifts`, `POST /shifts`, `PUT /shifts/{shift_id}`.
- `deviceService`: `GET /devices`, `PUT /devices/{device_id}/trust`, `GET /devices/me` for contract completeness but hidden from dashboard employee flows.
- `auditLogService`: `GET /audit-logs/`, `GET /audit-logs/{log_id}`.
- `notificationService`: `GET /notifications`, `PUT /notifications/{notification_id}/read`, `PUT /notifications/read-all`, `GET /notifications/preferences`, `PUT /notifications/preferences`.

## Mock Data Strategy

Mocks are not a substitute for services. They support development, tests, and disconnected screen work while services still call real endpoints.

Mock data must follow OpenAPI schema names and field names. Initial mocks should cover:

- Auth users for seeded roles from `dev/SWAGGER_MANUAL_TEST_DATA.md`: admin, hr, manager, employee.
- `AccountInfo`, `EmployeeInfo`, `LoginData`, `MeData`, and `RefreshData`.
- `DashboardSummaryData` with `active_locations` matching `ActiveLocationItem`.
- `RealtimeLocationItem` for ArcGIS marker development.
- Building, floor, and geofence items matching fields used by OpenAPI request/response examples.
- Attendance report summary, employee summaries, and day details.
- Exceptions, attendance detail, fraud records, audit logs, devices, departments, shifts, and notifications.

Mocks should be placed under `src/lib/mocks`. Test code can import mocks directly. Runtime services should not silently fall back to mocks in Phase 0.

## ArcGIS Foundation

Install `@arcgis/core` in Phase 0. ArcGIS assets and CSS must be imported according to package requirements.

Map modules:

- `src/lib/map/arcgisConfig.ts`: reads and validates `VITE_ARCGIS_*` env values.
- `src/lib/map/createSceneView.ts`: creates and destroys ArcGIS `SceneView` instances.
- `src/lib/map/types.ts`: app-level map item types independent from raw ArcGIS classes.
- `src/components/map/ArcgisScene.tsx`: React component that owns the map container lifecycle and exposes event callbacks for later screens.

The component should support an empty scene using configured center/zoom and also allow `VITE_ARCGIS_WEBSCENE_ID` when provided. Later screens will pass employee markers, floor context, and geofence overlays through app-level props rather than importing ArcGIS directly.

## UI Foundation

Shared Vietnamese primitives:

- Button, Input, Select, DatePicker, Table, Badge, Card, Modal, Drawer, Tabs, Toast.
- Loading, empty, error, forbidden, and not-found states.
- Form helper text and validation messages in Vietnamese.
- Confirmation dialog foundation for destructive actions.

Phase 0 can implement minimal but production-usable primitives. The goal is shared API and styling consistency, not all screen-specific visual polish.

## Vietnamese Labels

Create enum label maps for:

- Roles: `employee`, `hr`, `manager`, `admin`.
- Employee status: `active`, `inactive`, `on_leave`, `terminated`.
- Attendance status values used by the API.
- Rejection/fraud reasons represented in API payloads.
- Device platform: `android`, `ios`, `web`, `other`.
- Notification type.
- Export format: Excel and PDF labels.
- Audit action type: `login`, `logout`, `create`, `update`, `delete`, `checkin`, `checkout`, `approve`, `reject`.

Unknown enum values should render as a safe Vietnamese fallback instead of breaking the UI.

## Dashboard Layout And Routing

Routes:

- `/login`: public login route.
- `/`: redirect based on auth state to `/overview` or `/login`.
- Protected shell routes for later screens: `/overview`, `/map`, `/geofences`, `/geofences/buildings`, `/reports`, `/exceptions`, `/admin`, `/admin/employees`, `/admin/departments`, `/admin/shifts`, `/admin/devices`, `/audit-logs`.

Protected layout:

- Sidebar with seven primary Vietnamese navigation items.
- Topbar with page title, refresh/status area, user menu, and logout action.
- Content area with consistent spacing.
- Responsive desktop/tablet behavior, with a collapsed sidebar for narrower dashboard widths.

Routes can render foundation page states until the matching screen phase implements full content. They must still enforce role permissions.

## Error Handling

Known backend error codes should map to Vietnamese messages. Unknown codes should show a general Vietnamese error with the original code available for debugging.

Baseline messages:

- Invalid credentials: `Email hoặc mật khẩu không đúng.`
- Locked or inactive account: `Tài khoản đã bị khóa hoặc chưa được kích hoạt.`
- No dashboard permission: `Tài khoản này không có quyền truy cập Dashboard.`
- Expired session: `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.`
- Network failure: `Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.`
- Forbidden: `Bạn không có quyền thực hiện thao tác này.`
- Not found: `Không tìm thấy dữ liệu yêu cầu.`
- Validation error: `Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.`

## Testing And Verification

Phase 0 verification should include:

- `npm run lint`.
- `npm run typecheck`.
- `npm run test`.
- `npm run build`.

Initial tests should cover:

- API client response parsing.
- API client query params.
- API client multipart request setup.
- API client binary download setup.
- Auth token storage, refresh, and logout behavior.
- Permission helpers for `manager`, `hr`, `admin`, and `employee`.
- Vietnamese enum labels and unknown fallback.
- Protected route role guard behavior.
- Shared page state components.

ArcGIS integration can be tested through lifecycle-safe component tests with ArcGIS imports mocked, while production build verifies that the real package bundles.

## Phase 0 Checklist Mapping

This design satisfies the foundation checklist decisions and guides implementation for:

- Dashboard-only scope.
- Supported roles and employee blocking.
- OpenAPI source of truth.
- API discrepancy reconciliation.
- ArcGIS as required map path.
- Vite React + TypeScript scaffold.
- Scripts, strict TypeScript, aliases, ESLint, Prettier.
- Environment variables.
- API client foundation.
- Auth, refresh, logout, and `401` handling.
- Query params, pagination, multipart uploads, and downloads.
- Vietnamese backend error mapping.
- Shared UI primitives and page states.
- Vietnamese enum labels.
- Protected dashboard layout.
