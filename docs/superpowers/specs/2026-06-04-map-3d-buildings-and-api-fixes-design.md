# Design: API-backed app + `/map` 3D-buildings toggle

Date: 2026-06-04
Status: Approved (brainstorming)

## Background

The desktop UI already calls real API services everywhere (`apiClient` → `/api/v1/...`).
A recent uncommitted refactor removed the `withFallback` mock-substitution helper and
the `MockDataBadge`, and added `src/lib/data/runtimeMocks.test.ts`, which fails the suite
if any `src/features/**` or `src/components/**` file imports `@/lib/mocks` or `withFallback`.

Removing `withFallback` did not introduce new functionality — it **exposed requests that
were always invalid**, because the helper used to silently swap in mock data whenever an
API call failed. So "make everything use the API instead of mock data" is, in practice,
"fix the requests the mocks were hiding".

## Evidence (verified against the running backend on :8000)

- Backend up (`/`, `/openapi.json` → 200). Dev server up (:5173 → 200).
- `GET /api/v1/employees` unauthenticated → `401 Not authenticated`.
- With a valid admin token:
  - `GET /employees?limit=200` → **422** `Input should be less than or equal to 100`.
  - `GET /devices?limit=200` → **422** (same cap).
  - `GET /departments`, `/shifts`, `/buildings/?include_floors=true`, `/geofences/`,
    `/realtime/employees-location` → 200.
  - GIS numeric fields are returned as **strings**:
    `center_lat:"10.86941960"`, `center_lng:"106.80408810"`, `radius_meters:"5.00"`,
    `altitude_min:"0.00"`, `altitude_max:"3.50"`.
  - `realtime/employees-location` → `{ data: [], meta: { refresh_interval_seconds: 30 } }`
    (empty is expected when nobody is checked in).

## Bugs

### Bug 1 — `limit: 200` exceeds the backend max of 100 → 422
The page uses `Promise.all`; one 422 rejects the whole batch, so the page renders
`ErrorState` with no data and no controls. This is the reported `/admin` breakage. It also
affects every page using `limit: 200`.

Call sites (all → `limit: 100`):
- `src/features/admin/AdminPage.tsx` (employees + devices)
- `src/features/admin/AdminDepartmentsPage.tsx`
- `src/features/admin/AdminEmployeesPage.tsx`
- `src/features/admin/AdminShiftsPage.tsx`
- `src/features/admin/AdminDevicesPage.tsx`
- `src/features/reports/ReportsPage.tsx`

### Bug 2 — GIS numeric fields arrive as strings
`gisMappers` forwards `center_lng/lat`, `radius_meters`, `altitude_*`, `altitude` straight
to ArcGIS (which needs real numbers), and the geofence pages compare
`altitude_min < altitude_max` (string comparison is wrong).

Fix: coerce to `Number` at the mapper boundary (`mapLocationToScenePoint`,
`mapBuildingToScene`, `mapGeofenceToScene`) and in the geofence/buildings pages where
numbers are compared or formatted. A small `toNum(value, fallback)` helper.

### Bug 3 — errors are swallowed
`AdminPage`'s `catch {}` hides the cause. Surface it (log + keep `ErrorState`) so future
failures are diagnosable. Keep `Promise.all` (it succeeds once Bug 1 is fixed).

## Feature — `/map` two-layer toggle

Two **independent** toggles in the MapPage filter bar (both may be on at once):

| Toggle | Default | Renders |
|---|---|---|
| Vùng geofence | ON | geofence circles + building point markers (current behavior) |
| Khối 3D tòa nhà | OFF | extruded 3D building volumes from API data |

Employee location points are always shown (the page's primary purpose).

### 3D volume construction (no footprint polygon in the API)
- For each `MapBuilding`, build a footprint by geodesic-buffering the center point.
  Radius = the largest geofence radius on that building if any exist, else a configurable
  default (~20m).
- Stack one extruded polygon **per floor** using `altitudeMin`/`altitudeMax`:
  base elevation = `altitudeMin`, extrude height = `altitudeMax − altitudeMin`.
  Floors get a subtle color ramp + semi-transparent walls. Buildings with no floor data
  fall back to a single block of a default height.
- Rendered with `PolygonSymbol3D` + `ExtrudeSymbol3DLayer`.

### Architecture change (serves the toggles)
Today `createSceneView` builds one combined `GraphicsLayer` and `ArcgisScene` fully
destroys + recreates the scene on any data change. To make toggles snappy:
- Split rendering into separate layers: `geofenceLayer`, `buildingMarkerLayer`,
  `building3dLayer`, `employeeLayer`.
- The scene handle exposes `setLayerVisibility({ geofences, buildings3d })`.
- `ArcgisScene`: one effect rebuilds graphics when **data** changes; a second effect flips
  **layer visibility** when **toggles** change — no rebuild, no camera reset.
- New ArcGIS modules in `arcgisSdkLoader`: `Polygon`, `geometryEngine` (geodesic buffer),
  and the 3D symbol classes (`PolygonSymbol3D`, `ExtrudeSymbol3DLayer`).
- `gisMappers`/`types` already carry floor altitudes — no new API fields needed.

## Testing
- TDD pure pieces (no ArcGIS): the `toNum` coercion in mappers; a
  `buildBuildingFootprint` / `buildFloorVolumes` builder.
- Extend `MapPage.test.tsx` (toggles render, default states) and
  `createSceneView.test.ts` (layers exist, `setLayerVisibility` toggles them).
- ArcGIS SDK stays mocked in tests as it is now.

## Verification
- Run dev app, log in, screenshot `/admin` (KPIs + employee table populated) and `/map`
  (geofence mode, then 3D-building mode).
- `npm run test`, lint, and typecheck green.

## Out of scope
- Real published BIM/SceneLayer building models (chosen approach is extrude-from-API).
- Server-side pagination UI beyond the existing controls.
- Re-introducing any mock fallback at runtime.
