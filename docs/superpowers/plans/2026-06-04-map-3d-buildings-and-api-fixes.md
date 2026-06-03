# /map 3D-buildings toggle + API fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every feature work against the real API (fix the requests the deleted mock-fallback was hiding), and add a two-layer toggle to `/map` — geofence view (current) and extruded 3D building volumes — without breaking current rendering.

**Architecture:** Two small bug fixes (request `limit` cap; GIS string→number coercion in the map mappers) restore `/admin`, the admin sub-pages, `/reports`, and correct map geometry. Then the ArcGIS scene is refactored from one combined `GraphicsLayer` into four purpose-specific layers; the scene handle gains `setLayerVisibility(...)` so `MapPage` checkboxes flip layer visibility without rebuilding the scene. 3D volumes reuse the already-loaded `Circle` geometry (a `Polygon` subclass) with a per-floor base elevation and an autocast `polygon-3d`/`extrude` symbol — so no new ArcGIS module imports are required.

**Tech Stack:** React 18 + TypeScript, Vite, Vitest + Testing Library, ArcGIS Maps SDK for JavaScript (loaded via CDN `$arcgis.import`).

---

## File Structure

**Modify**
- `src/features/admin/AdminPage.tsx` — `limit: 200 → 100` (×2); surface load error.
- `src/features/admin/AdminDepartmentsPage.tsx` — `limit: 200 → 100`.
- `src/features/admin/AdminEmployeesPage.tsx` — `limit: 200 → 100`.
- `src/features/admin/AdminShiftsPage.tsx` — `limit: 200 → 100`.
- `src/features/admin/AdminDevicesPage.tsx` — `limit: 200 → 100`.
- `src/features/reports/ReportsPage.tsx` — `limit: 200 → 100`.
- `src/lib/map/gisMappers.ts` — `toNum` coercion for GIS numeric fields.
- `src/lib/map/types.ts` — extend `ArcgisSceneHandle` with `setLayerVisibility`.
- `src/lib/map/createSceneView.ts` — split into 4 layers; add 3D extrusions; return `setLayerVisibility`.
- `src/components/map/ArcgisScene.tsx` — `showGeofences` / `showBuildings3d` props + visibility effect.
- `src/features/map/MapPage.tsx` — toggle state + checkbox controls + wiring.

**Create**
- `src/features/admin/AdminPage.test.tsx` — regression test for `limit: 100` + renders data.
- `src/lib/map/buildingVolumes.ts` — pure helper `buildFloorExtrusions`.
- `src/lib/map/buildingVolumes.test.ts` — unit tests for the helper.

**Modify (tests)**
- `src/lib/map/gisMappers.test.ts` — add string-input coercion cases.
- `src/lib/map/createSceneView.test.ts` — assert layers + 3D extrusion graphics + visibility.
- `src/features/map/MapPage.test.tsx` — assert default toggle props + toggle interaction.

**Constants** (defined in `buildingVolumes.ts`, reused by `createSceneView.ts`)
- `DEFAULT_FOOTPRINT_RADIUS_M = 20`
- `DEFAULT_FLOOR_HEIGHT_M = 3.5`

---

## Task 1: Fix `limit: 200` → `100` (restores /admin, admin sub-pages, /reports)

**Why:** The backend rejects `limit > 100` with HTTP 422. `AdminPage` uses `Promise.all`, so one 422 blanks the whole page (`ErrorState`). The deleted `withFallback` used to mask this with mock data.

**Files:**
- Create: `src/features/admin/AdminPage.test.tsx`
- Modify: `src/features/admin/AdminPage.tsx`
- Modify: `src/features/admin/AdminDepartmentsPage.tsx:43`
- Modify: `src/features/admin/AdminEmployeesPage.tsx:77`
- Modify: `src/features/admin/AdminShiftsPage.tsx:57`
- Modify: `src/features/admin/AdminDevicesPage.tsx:44`
- Modify: `src/features/reports/ReportsPage.tsx:46`

- [ ] **Step 1: Write the failing test** — `src/features/admin/AdminPage.test.tsx`

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminPage } from './AdminPage';

const adminMocks = vi.hoisted(() => ({
  employeeList: vi.fn(),
  departmentList: vi.fn(),
  shiftList: vi.fn(),
  deviceList: vi.fn(),
}));

vi.mock('@/services/employeeService', () => ({ employeeService: { list: adminMocks.employeeList } }));
vi.mock('@/services/departmentService', () => ({ departmentService: { list: adminMocks.departmentList } }));
vi.mock('@/services/shiftService', () => ({ shiftService: { list: adminMocks.shiftList } }));
vi.mock('@/services/deviceService', () => ({ deviceService: { list: adminMocks.deviceList } }));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMocks.employeeList.mockResolvedValue({
      success: true,
      data: [
        {
          employee_id: 1,
          department_id: 1,
          department_name: 'Administration',
          full_name: 'System Admin',
          email: 'admin@example.com',
          position: 'Admin',
          status: 'active',
        },
      ],
    });
    adminMocks.departmentList.mockResolvedValue({ success: true, data: [{ department_id: 1, name: 'Administration' }] });
    adminMocks.shiftList.mockResolvedValue({ success: true, data: [] });
    adminMocks.deviceList.mockResolvedValue({ success: true, data: [] });
  });

  it('requests employees and devices within the backend limit of 100', async () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('System Admin')).toBeInTheDocument());
    expect(adminMocks.employeeList).toHaveBeenCalledWith({ limit: 100 });
    expect(adminMocks.deviceList).toHaveBeenCalledWith({ limit: 100 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/admin/AdminPage.test.tsx`
Expected: FAIL — `employeeService.list` called with `{ limit: 200 }`, not `{ limit: 100 }`.

- [ ] **Step 3: Fix `AdminPage.tsx`** — change both calls (lines 27 and 30):

```tsx
          employeeService.list({ limit: 100 }),
          departmentService.list(),
          shiftService.list(),
          deviceService.list({ limit: 100 }),
```

Also replace the silent `catch {}` so failures are diagnosable (keep `ErrorState`):

```tsx
      } catch (error) {
        console.error('AdminPage load failed', error);
        setLoadError(true);
      } finally {
```

- [ ] **Step 4: Fix the other five call sites** — in each file change `limit: 200` to `limit: 100`:
  - `src/features/admin/AdminDepartmentsPage.tsx:43` → `employeeService.list({ limit: 100 }),`
  - `src/features/admin/AdminEmployeesPage.tsx:77` → `employeeService.list({ limit: 100 }),`
  - `src/features/admin/AdminShiftsPage.tsx:57` → `employeeService.list({ limit: 100 }),`
  - `src/features/admin/AdminDevicesPage.tsx:44` → `const { data } = await deviceService.list({ limit: 100 });`
  - `src/features/reports/ReportsPage.tsx:46` → `employeeService.list({ limit: 100 }),`

- [ ] **Step 5: Verify no `limit: 200` remains**

Run: `npx grep -rn "limit: 200" src` — or use editor search.
Expected: no matches.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/features/admin/AdminPage.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin src/features/reports/ReportsPage.tsx
git commit -m "fix: cap list limit at 100 so admin/reports pages load (backend rejects >100)"
```

---

## Task 2: Coerce GIS string numerics in the map mappers

**Why:** The backend returns `center_lat`, `center_lng`, `radius_meters`, `altitude_*`, `altitude` as JSON strings (`"10.869..."`, `"5.00"`). ArcGIS geometry needs real numbers. (The geofence/buildings pages already coerce via `String()`/`Number()`, so only the map mappers need fixing.)

**Files:**
- Modify: `src/lib/map/gisMappers.ts`
- Test: `src/lib/map/gisMappers.test.ts`

- [ ] **Step 1: Add the failing test** — append inside the `describe('GIS scene mappers', ...)` block in `gisMappers.test.ts`:

```ts
  it('coerces string numeric fields from the API into numbers', () => {
    const building = {
      building_id: 2,
      name: 'Demo House',
      address: 'HCMC',
      center_lat: '10.86941960',
      center_lng: '106.80408810',
      total_floors: 1,
      arcgis_layer_id: 'demo-shell',
      floors: [
        { floor_id: 1, building_id: 2, floor_number: 1, floor_name: 'F1', altitude_min: '0.00', altitude_max: '3.50' },
      ],
    } as unknown as BuildingItem;

    const mapped = mapBuildingToScene(building);
    expect(mapped.longitude).toBe(106.8040881);
    expect(mapped.latitude).toBe(10.8694196);
    expect(mapped.floors).toEqual([{ id: 'floor-1', name: 'F1', altitudeMin: 0, altitudeMax: 3.5 }]);

    const geofence = {
      geofence_id: 9,
      floor_id: 1,
      name: 'Room 101',
      building_id: 2,
      building_name: 'Demo House',
      floor_name: 'F1',
      center_lat: '10.86941310',
      center_lng: '106.80403377',
      radius_meters: '5.00',
      altitude_min: '0.00',
      altitude_max: '3.50',
      allow_checkin: true,
      allow_checkout: true,
      is_active: true,
    } as unknown as GeofenceItem;

    const mappedGeofence = mapGeofenceToScene(geofence);
    expect(mappedGeofence.radiusMeters).toBe(5);
    expect(mappedGeofence.altitudeMin).toBe(0);
    expect(mappedGeofence.altitudeMax).toBe(3.5);
    expect(mappedGeofence.longitude).toBe(106.80403377);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/map/gisMappers.test.ts`
Expected: FAIL — e.g. `expected '106.80408810' to be 106.8040881` (string not coerced).

- [ ] **Step 3: Implement coercion** — replace the full contents of `src/lib/map/gisMappers.ts`:

```ts
import type { BuildingItem, GeofenceItem, RealtimeLocationItem } from '@/types/api';
import type { MapBuilding, MapGeofence, MapPoint } from './types';

function toNum(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNum(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapLocationToScenePoint(location: RealtimeLocationItem): MapPoint {
  return {
    id: `employee-${location.employee_id}-record-${location.record_id}`,
    longitude: toNum(location.longitude),
    latitude: toNum(location.latitude),
    altitude: toNullableNum(location.altitude),
    title: location.full_name,
    description: [location.department_name, location.building_name, location.floor_name].filter(Boolean).join(' • '),
  };
}

export function mapBuildingToScene(building: BuildingItem): MapBuilding {
  return {
    id: `building-${building.building_id}`,
    name: building.name,
    longitude: toNum(building.center_lng),
    latitude: toNum(building.center_lat),
    address: building.address,
    arcgisLayerId: building.arcgis_layer_id,
    floors: (building.floors ?? []).map((floor) => ({
      id: `floor-${floor.floor_id}`,
      name: floor.floor_name,
      altitudeMin: toNum(floor.altitude_min),
      altitudeMax: toNum(floor.altitude_max),
    })),
  };
}

export function mapGeofenceToScene(geofence: GeofenceItem): MapGeofence {
  return {
    id: `geofence-${geofence.geofence_id}`,
    name: geofence.name,
    longitude: toNum(geofence.center_lng),
    latitude: toNum(geofence.center_lat),
    radiusMeters: toNum(geofence.radius_meters),
    altitudeMin: toNum(geofence.altitude_min),
    altitudeMax: toNum(geofence.altitude_max),
    buildingName: geofence.building_name,
    floorName: geofence.floor_name,
    isActive: geofence.is_active,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/map/gisMappers.test.ts`
Expected: PASS (new test + the three existing tests, which used numeric inputs).

- [ ] **Step 5: Commit**

```bash
git add src/lib/map/gisMappers.ts src/lib/map/gisMappers.test.ts
git commit -m "fix: coerce API string lat/lng/radius/altitude to numbers for the 3D scene"
```

---

## Task 3: Pure helper — `buildFloorExtrusions`

**Why:** Compute per-floor extrusion descriptors (base elevation + height) deterministically, so the 3D-volume math is unit-tested without ArcGIS. `createSceneView` consumes these.

**Files:**
- Create: `src/lib/map/buildingVolumes.ts`
- Test: `src/lib/map/buildingVolumes.test.ts`

- [ ] **Step 1: Write the failing test** — `src/lib/map/buildingVolumes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { buildFloorExtrusions, DEFAULT_FLOOR_HEIGHT_M } from './buildingVolumes';
import type { MapBuilding } from './types';

const baseBuilding: MapBuilding = {
  id: 'building-1',
  name: 'Demo House',
  longitude: 106.804,
  latitude: 10.869,
  floors: [
    { id: 'floor-1', name: 'F1', altitudeMin: 0, altitudeMax: 3.5 },
    { id: 'floor-2', name: 'F2', altitudeMin: 3.5, altitudeMax: 7 },
  ],
};

describe('buildFloorExtrusions', () => {
  it('returns one extrusion per floor using altitude range as base + height', () => {
    expect(buildFloorExtrusions(baseBuilding)).toEqual([
      { baseZ: 0, height: 3.5, label: 'F1', colorIndex: 0 },
      { baseZ: 3.5, height: 3.5, label: 'F2', colorIndex: 1 },
    ]);
  });

  it('falls back to a single default-height block when no floors are present', () => {
    expect(buildFloorExtrusions({ ...baseBuilding, floors: [] })).toEqual([
      { baseZ: 0, height: DEFAULT_FLOOR_HEIGHT_M, label: 'Demo House', colorIndex: 0 },
    ]);
  });

  it('clamps non-positive floor heights to a minimum so the volume stays visible', () => {
    const result = buildFloorExtrusions({
      ...baseBuilding,
      floors: [{ id: 'floor-1', name: 'F1', altitudeMin: 5, altitudeMax: 5 }],
    });
    expect(result[0].baseZ).toBe(5);
    expect(result[0].height).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/map/buildingVolumes.test.ts`
Expected: FAIL — `Cannot find module './buildingVolumes'`.

- [ ] **Step 3: Implement** — `src/lib/map/buildingVolumes.ts`:

```ts
import type { MapBuilding } from './types';

export const DEFAULT_FOOTPRINT_RADIUS_M = 20;
export const DEFAULT_FLOOR_HEIGHT_M = 3.5;
const MIN_FLOOR_HEIGHT_M = 0.5;

export interface FloorExtrusion {
  baseZ: number;
  height: number;
  label: string;
  colorIndex: number;
}

export function buildFloorExtrusions(building: MapBuilding): FloorExtrusion[] {
  const floors = building.floors ?? [];
  if (floors.length === 0) {
    return [{ baseZ: 0, height: DEFAULT_FLOOR_HEIGHT_M, label: building.name, colorIndex: 0 }];
  }
  return floors.map((floor, index) => ({
    baseZ: floor.altitudeMin,
    height: Math.max(floor.altitudeMax - floor.altitudeMin, MIN_FLOOR_HEIGHT_M),
    label: floor.name,
    colorIndex: index,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/map/buildingVolumes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/map/buildingVolumes.ts src/lib/map/buildingVolumes.test.ts
git commit -m "feat: add buildFloorExtrusions helper for 3D building volumes"
```

---

## Task 4: Refactor `createSceneView` into layers + 3D extrusions + `setLayerVisibility`

**Why:** Toggles must flip layer visibility without rebuilding the scene (no camera reset). Split the single layer into four; add extruded 3D building volumes (reusing `Circle` as the footprint polygon with a per-floor base `z`); expose `setLayerVisibility`.

**Files:**
- Modify: `src/lib/map/types.ts`
- Modify: `src/lib/map/createSceneView.ts`
- Test: `src/lib/map/createSceneView.test.ts`

- [ ] **Step 1: Extend the handle type** — in `src/lib/map/types.ts`, replace the `ArcgisSceneHandle` interface:

```ts
export interface SceneLayerVisibility {
  geofences?: boolean;
  buildings3d?: boolean;
}

export interface ArcgisSceneHandle {
  destroy(): void;
  setLayerVisibility(visibility: SceneLayerVisibility): void;
}
```

- [ ] **Step 2: Update the createSceneView test** — replace the body of `src/lib/map/createSceneView.test.ts` with the version below. It tracks per-layer instances, asserts 3D extrusion circles are created (one per floor), and exercises `setLayerVisibility`.

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const arcgisMocks = vi.hoisted(() => {
  const createdGraphics: unknown[] = [];
  const createdPoints: unknown[] = [];
  const createdCircles: { center: unknown; radius: number; radiusUnit: string }[] = [];
  const layers: { title: string; visible: boolean; graphics: unknown[] }[] = [];
  const values = {
    config: {},
    createdCircles,
    createdGraphics,
    createdPoints,
    layers,
    destroy: vi.fn(),
    loadArcgisCoreModules: vi.fn(),
    map: vi.fn(),
    mapAdd: vi.fn(),
    sceneView: vi.fn(),
    sceneViewWhen: vi.fn(() => Promise.resolve()),
    webScene: vi.fn(),
  };

  class MockGraphic {
    constructor(options: unknown) {
      createdGraphics.push(options);
    }
  }
  class MockPoint {
    constructor(options: unknown) {
      createdPoints.push(options);
    }
  }
  class MockCircle {
    constructor(options: { center: unknown; radius: number; radiusUnit: string }) {
      createdCircles.push(options);
    }
  }
  class MockGraphicsLayer {
    title: string;
    visible = true;
    graphics: unknown[] = [];
    constructor(options: { title?: string }) {
      this.title = options?.title ?? '';
      layers.push(this);
    }
    addMany(graphics: unknown[]) {
      this.graphics.push(...graphics);
    }
  }
  class MockMap {
    constructor(options: unknown) {
      values.map(options);
    }
    add = values.mapAdd;
  }
  class MockWebScene {
    constructor(options: unknown) {
      values.webScene(options);
    }
    add = values.mapAdd;
  }
  class MockSceneView {
    constructor(options: unknown) {
      values.sceneView(options);
    }
    destroy = values.destroy;
    when = values.sceneViewWhen;
  }

  return { ...values, MockCircle, MockGraphic, MockGraphicsLayer, MockMap, MockPoint, MockSceneView, MockWebScene };
});

vi.mock('./arcgisSdkLoader', () => ({ loadArcgisCoreModules: arcgisMocks.loadArcgisCoreModules }));

import { createSceneView } from './createSceneView';

function layerByTitle(fragment: string) {
  return arcgisMocks.layers.find((layer) => layer.title.includes(fragment));
}

describe('createSceneView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    arcgisMocks.createdCircles.length = 0;
    arcgisMocks.createdGraphics.length = 0;
    arcgisMocks.createdPoints.length = 0;
    arcgisMocks.layers.length = 0;
    arcgisMocks.loadArcgisCoreModules.mockResolvedValue({
      config: arcgisMocks.config,
      Graphic: arcgisMocks.MockGraphic,
      Point: arcgisMocks.MockPoint,
      Circle: arcgisMocks.MockCircle,
      GraphicsLayer: arcgisMocks.MockGraphicsLayer,
      Map: arcgisMocks.MockMap,
      WebScene: arcgisMocks.MockWebScene,
      SceneView: arcgisMocks.MockSceneView,
    });
  });

  const sceneArgs = {
    container: () => document.createElement('div'),
    config: {
      apiKey: '',
      portalUrl: 'https://www.arcgis.com',
      webSceneId: '',
      defaultCenter: { longitude: 106.700981, latitude: 10.776889 },
      defaultZoom: 17,
    },
    points: [
      { id: 'employee-1', longitude: 106.701, latitude: 10.777, altitude: 24, title: 'Anna', description: 'Ops' },
    ],
    buildings: [
      {
        id: 'building-1',
        name: 'AMA Tower',
        longitude: 106.700981,
        latitude: 10.776889,
        address: 'Q1',
        arcgisLayerId: 'ama-building-layer',
        floors: [
          { id: 'floor-1', name: 'Tầng 1', altitudeMin: 0, altitudeMax: 3.5 },
          { id: 'floor-2', name: 'Tầng 2', altitudeMin: 3.5, altitudeMax: 7 },
        ],
      },
    ],
    geofences: [
      { id: 'geofence-1', name: 'Sảnh chính', longitude: 106.7009, latitude: 10.7768, radiusMeters: 30, altitudeMin: 0, altitudeMax: 7, isActive: true },
    ],
  };

  it('builds separate layers, a geofence circle, and one extruded circle per floor', async () => {
    await createSceneView({
      container: sceneArgs.container(),
      config: sceneArgs.config,
      points: sceneArgs.points,
      buildings: sceneArgs.buildings,
      geofences: sceneArgs.geofences,
    });

    expect(arcgisMocks.loadArcgisCoreModules).toHaveBeenCalledTimes(1);
    expect(arcgisMocks.map).toHaveBeenCalledWith({ basemap: 'osm' });
    expect(layerByTitle('geofence')).toBeDefined();
    expect(layerByTitle('Tòa nhà 3D')).toBeDefined();

    // 1 geofence circle + 2 floor footprint circles = 3 circles total.
    expect(arcgisMocks.createdCircles).toHaveLength(3);
    const footprintCircles = arcgisMocks.createdCircles.filter((circle) => circle.radius === 20);
    expect(footprintCircles).toHaveLength(2);

    const employeeAndMarkerPoints = arcgisMocks.createdPoints.filter(Boolean);
    expect(employeeAndMarkerPoints.length).toBeGreaterThanOrEqual(2);
  });

  it('initialises layer visibility from options and toggles it without rebuilding', async () => {
    const handle = await createSceneView({
      container: sceneArgs.container(),
      config: sceneArgs.config,
      points: sceneArgs.points,
      buildings: sceneArgs.buildings,
      geofences: sceneArgs.geofences,
      visibility: { geofences: true, buildings3d: false },
    });

    const geofenceLayer = layerByTitle('geofence');
    const building3dLayer = layerByTitle('Tòa nhà 3D');
    expect(geofenceLayer?.visible).toBe(true);
    expect(building3dLayer?.visible).toBe(false);

    handle.setLayerVisibility({ geofences: false, buildings3d: true });
    expect(geofenceLayer?.visible).toBe(false);
    expect(building3dLayer?.visible).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/map/createSceneView.test.ts`
Expected: FAIL — `setLayerVisibility` missing and only one layer / no footprint circles created.

- [ ] **Step 4: Implement** — replace the full contents of `src/lib/map/createSceneView.ts`:

```ts
import type { ArcgisRuntimeConfig } from './arcgisConfig';
import { buildFloorExtrusions, DEFAULT_FOOTPRINT_RADIUS_M } from './buildingVolumes';
import { loadArcgisCoreModules } from './arcgisSdkLoader';
import type {
  ArcgisSceneHandle,
  MapBuilding,
  MapGeofence,
  MapPoint,
  SceneLayerVisibility,
} from './types';

export interface CreateSceneViewOptions {
  container: HTMLDivElement;
  config: ArcgisRuntimeConfig;
  points?: MapPoint[];
  buildings?: MapBuilding[];
  geofences?: MapGeofence[];
  visibility?: SceneLayerVisibility;
}

interface GraphicsLayerLike {
  visible: boolean;
  addMany(graphics: unknown[]): void;
}

interface MapLike {
  add(layer: unknown): void;
}

interface ViewLike {
  destroy(): void;
  when(): Promise<void>;
}

// Subtle blue → amber ramp so stacked floors read as distinct slabs.
const FLOOR_COLORS = [
  [37, 99, 235, 0.55],
  [16, 185, 129, 0.55],
  [245, 158, 11, 0.55],
  [139, 92, 246, 0.55],
];

function floorSummary(building: MapBuilding): string {
  if (!building.floors || building.floors.length === 0) {
    return 'Chưa có dữ liệu tầng.';
  }
  return building.floors.map((floor) => `${floor.name}: ${floor.altitudeMin}-${floor.altitudeMax} m`).join('<br />');
}

export async function createSceneView({
  container,
  config,
  points = [],
  buildings = [],
  geofences = [],
  visibility,
}: CreateSceneViewOptions): Promise<ArcgisSceneHandle> {
  const { config: esriConfig, Graphic, Point, Circle, GraphicsLayer, Map: ArcgisMap, WebScene, SceneView } =
    await loadArcgisCoreModules();

  if (config.apiKey) {
    esriConfig.apiKey = config.apiKey;
  }
  esriConfig.portalUrl = config.portalUrl;

  const showGeofences = visibility?.geofences ?? true;
  const showBuildings3d = visibility?.buildings3d ?? false;

  const geofenceLayer = new GraphicsLayer({ title: 'Vùng geofence AMA' }) as GraphicsLayerLike;
  const buildingMarkerLayer = new GraphicsLayer({ title: 'Tòa nhà (điểm)' }) as GraphicsLayerLike;
  const building3dLayer = new GraphicsLayer({
    title: 'Tòa nhà 3D AMA',
    elevationInfo: { mode: 'absolute' },
  }) as GraphicsLayerLike;
  const employeeLayer = new GraphicsLayer({ title: 'Nhân viên (thời gian thực)' }) as GraphicsLayerLike;

  geofenceLayer.addMany(
    geofences.map(
      (geofence) =>
        new Graphic({
          geometry: new Circle({
            center: [geofence.longitude, geofence.latitude],
            geodesic: true,
            numberOfPoints: 96,
            radius: geofence.radiusMeters,
            radiusUnit: 'meters',
          }),
          attributes: geofence,
          symbol: {
            type: 'simple-fill',
            color: geofence.isActive ? [59, 130, 246, 0.18] : [148, 163, 184, 0.14],
            outline: {
              color: geofence.isActive ? [37, 99, 235, 0.9] : [100, 116, 139, 0.8],
              width: 1.5,
            },
          },
          popupTemplate: {
            title: geofence.name,
            content: [
              geofence.buildingName ? `Tòa nhà: ${geofence.buildingName}` : null,
              geofence.floorName ? `Tầng: ${geofence.floorName}` : null,
              `Bán kính: ${geofence.radiusMeters} m`,
              `Độ cao: ${geofence.altitudeMin}-${geofence.altitudeMax} m`,
            ]
              .filter(Boolean)
              .join('<br />'),
          },
        }),
    ),
  );

  buildingMarkerLayer.addMany(
    buildings.map(
      (building) =>
        new Graphic({
          geometry: new Point({
            longitude: building.longitude,
            latitude: building.latitude,
            z: building.floors?.[0]?.altitudeMin ?? 0,
          }),
          attributes: building,
          symbol: {
            type: 'simple-marker',
            style: 'square',
            color: [245, 158, 11, 0.95],
            outline: { color: [120, 53, 15, 1], width: 1 },
            size: 12,
          },
          popupTemplate: {
            title: building.name,
            content: [
              building.address ? `Địa chỉ: ${building.address}` : null,
              building.arcgisLayerId ? `ArcGIS layer: ${building.arcgisLayerId}` : null,
              floorSummary(building),
            ]
              .filter(Boolean)
              .join('<br />'),
          },
        }),
    ),
  );

  const buildingGraphics = buildings.flatMap((building) =>
    buildFloorExtrusions(building).map(
      (floor) =>
        new Graphic({
          geometry: new Circle({
            center: [building.longitude, building.latitude, floor.baseZ],
            geodesic: true,
            numberOfPoints: 48,
            radius: DEFAULT_FOOTPRINT_RADIUS_M,
            radiusUnit: 'meters',
          }),
          attributes: { building: building.name, floor: floor.label },
          symbol: {
            type: 'polygon-3d',
            symbolLayers: [
              {
                type: 'extrude',
                size: floor.height,
                material: { color: FLOOR_COLORS[floor.colorIndex % FLOOR_COLORS.length] },
                edges: { type: 'solid', color: [30, 41, 59, 0.6], size: 0.5 },
              },
            ],
          },
          popupTemplate: {
            title: `${building.name} — ${floor.label}`,
            content: `Độ cao đáy: ${floor.baseZ} m<br />Chiều cao: ${floor.height} m`,
          },
        }),
    ),
  );
  building3dLayer.addMany(buildingGraphics);

  employeeLayer.addMany(
    points.map(
      (point) =>
        new Graphic({
          geometry: new Point({
            longitude: point.longitude,
            latitude: point.latitude,
            z: point.altitude ?? 0,
          }),
          attributes: point,
          symbol: {
            type: 'simple-marker',
            color: [16, 185, 129, 0.95],
            outline: { color: [6, 78, 59, 1], width: 1 },
            size: 9,
          },
          popupTemplate: {
            title: point.title,
            content: point.description ?? '',
          },
        }),
    ),
  );

  geofenceLayer.visible = showGeofences;
  buildingMarkerLayer.visible = showGeofences;
  building3dLayer.visible = showBuildings3d;

  const map = config.webSceneId
    ? new WebScene({ portalItem: { id: config.webSceneId } })
    : new ArcgisMap({ basemap: 'osm' });

  const mapLike = map as MapLike;
  mapLike.add(geofenceLayer);
  mapLike.add(buildingMarkerLayer);
  mapLike.add(building3dLayer);
  mapLike.add(employeeLayer);

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
  }) as ViewLike;

  await view.when();

  return {
    destroy: () => view.destroy(),
    setLayerVisibility: ({ geofences: nextGeofences, buildings3d: nextBuildings3d }) => {
      if (nextGeofences !== undefined) {
        geofenceLayer.visible = nextGeofences;
        buildingMarkerLayer.visible = nextGeofences;
      }
      if (nextBuildings3d !== undefined) {
        building3dLayer.visible = nextBuildings3d;
      }
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/map/createSceneView.test.ts`
Expected: PASS (both tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/map/types.ts src/lib/map/createSceneView.ts src/lib/map/createSceneView.test.ts
git commit -m "feat: split scene into layers and render extruded 3D building volumes"
```

---

## Task 5: `ArcgisScene` — toggle props + visibility effect (no rebuild)

**Why:** Translate toggle props into `setLayerVisibility` calls, and pass the initial visibility at mount. The data effect keeps rebuilding only on data change; a separate effect handles toggles.

**Files:**
- Modify: `src/components/map/ArcgisScene.tsx`

- [ ] **Step 1: Implement** — replace the full contents of `src/components/map/ArcgisScene.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';

import { buildArcgisRuntimeConfig } from '@/lib/map/arcgisConfig';
import { createSceneView } from '@/lib/map/createSceneView';
import type { ArcgisSceneHandle, MapBuilding, MapGeofence, MapPoint } from '@/lib/map/types';

interface ArcgisSceneProps {
  title: string;
  points?: MapPoint[];
  buildings?: MapBuilding[];
  geofences?: MapGeofence[];
  showGeofences?: boolean;
  showBuildings3d?: boolean;
  className?: string;
}

export function ArcgisScene({
  title,
  points = [],
  buildings = [],
  geofences = [],
  showGeofences = true,
  showBuildings3d = false,
  className,
}: ArcgisSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ArcgisSceneHandle | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Latest toggle values, read at mount time without forcing a rebuild.
  const visibilityRef = useRef({ geofences: showGeofences, buildings3d: showBuildings3d });
  visibilityRef.current = { geofences: showGeofences, buildings3d: showBuildings3d };

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
          buildings,
          geofences,
          visibility: visibilityRef.current,
        });
        if (cancelled) {
          handleRef.current.destroy();
          handleRef.current = null;
        }
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
  }, [points, buildings, geofences]);

  useEffect(() => {
    handleRef.current?.setLayerVisibility({ geofences: showGeofences, buildings3d: showBuildings3d });
  }, [showGeofences, showBuildings3d]);

  return (
    <section className={className} aria-label={title} role="region">
      {error ? <p role="alert">{error}</p> : null}
      <div ref={containerRef} className="arcgis-scene" />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck this file compiles**

Run: `npm run typecheck`
Expected: PASS (no type errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/map/ArcgisScene.tsx
git commit -m "feat: ArcgisScene toggles layer visibility without rebuilding the scene"
```

---

## Task 6: `MapPage` — toggle state, checkbox controls, and wiring

**Why:** Expose the two independent toggles (geofence default ON, 3D buildings default OFF) and pass them to `ArcgisScene`.

**Files:**
- Modify: `src/features/map/MapPage.tsx`
- Test: `src/features/map/MapPage.test.tsx`

- [ ] **Step 1: Add the failing test** — append a new `it(...)` inside the `describe('MapPage', ...)` block in `MapPage.test.tsx`, and add the import for `fireEvent`/`screen` at the top (update the existing import line):

Update the top import to:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
```

Append this test:

```tsx
  it('passes default toggle state and updates it when the 3D buildings toggle is clicked', async () => {
    render(<MapPage />);

    await waitFor(() => expect(mapMocks.arcgisSceneProps.length).toBeGreaterThan(0));
    expect(mapMocks.arcgisSceneProps.at(-1)).toMatchObject({ showGeofences: true, showBuildings3d: false });

    fireEvent.click(screen.getByLabelText('Khối 3D tòa nhà'));

    await waitFor(() =>
      expect(mapMocks.arcgisSceneProps.at(-1)).toMatchObject({ showGeofences: true, showBuildings3d: true }),
    );
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/features/map/MapPage.test.tsx`
Expected: FAIL — `showGeofences`/`showBuildings3d` undefined; no element labelled "Khối 3D tòa nhà".

- [ ] **Step 3: Implement** — in `src/features/map/MapPage.tsx`:

(a) Add toggle state after the existing `selectedId` state (after line 29):

```tsx
  const [showGeofences, setShowGeofences] = useState(true);
  const [showBuildings3d, setShowBuildings3d] = useState(false);
```

(b) Add the two checkboxes inside the `<div className="filter-bar">` block, right after the Phòng ban `<Select ... />` (after the third Select closes, before `</div>`):

```tsx
        <label className="map-toggle">
          <input
            type="checkbox"
            checked={showGeofences}
            onChange={(event) => setShowGeofences(event.target.checked)}
          />
          Vùng geofence
        </label>
        <label className="map-toggle">
          <input
            type="checkbox"
            checked={showBuildings3d}
            onChange={(event) => setShowBuildings3d(event.target.checked)}
          />
          Khối 3D tòa nhà
        </label>
```

(c) Pass the toggles to `ArcgisScene` (extend the existing element around line 163):

```tsx
          <ArcgisScene
            title="Bản đồ 3D vị trí nhân viên"
            points={filtered.map(mapLocationToScenePoint)}
            buildings={buildings.map(mapBuildingToScene)}
            geofences={sceneGeofences.map(mapGeofenceToScene)}
            showGeofences={showGeofences}
            showBuildings3d={showBuildings3d}
          />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/features/map/MapPage.test.tsx`
Expected: PASS (existing test + new toggle test).

- [ ] **Step 5: Commit**

```bash
git add src/features/map/MapPage.tsx src/features/map/MapPage.test.tsx
git commit -m "feat: add geofence + 3D building layer toggles to the map page"
```

---

## Task 7: Full verification (suite + manual)

**Why:** Confirm nothing regressed and both reported problems are actually fixed against the real backend.

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm run test`
Expected: all tests pass, including `src/lib/data/runtimeMocks.test.ts` (no runtime mock imports introduced).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors (add the `.map-toggle` style only if lint/design requires; checkboxes work without it).

- [ ] **Step 4: Manual — `/admin` shows data**

- Ensure backend is reachable (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/` → `200`).
- `npm run dev`, open `http://localhost:5173`, log in (or register a demo admin via the login screen).
- Open `/admin`. Expected: KPI cards show non-zero counts and the employee summary table is populated (no `ErrorState`).
- Confirm in DevTools Network that `/api/v1/employees?limit=100` and `/api/v1/devices?limit=100` return `200` (not `422`).

- [ ] **Step 5: Manual — `/map` both modes**

- Open `/map`. Expected: scene renders; "Vùng geofence" checked by default → geofence circles + building markers visible; employee dots appear when there are active check-ins.
- Tick "Khối 3D tòa nhà". Expected: extruded 3D building volume(s) appear at the building location, stacked per floor; the camera does NOT reset/reload when toggling.
- Untick "Vùng geofence". Expected: geofence circles + building markers hide; 3D volumes remain.
- Exercise the Tòa nhà / Tầng / Phòng ban filters and row selection → detail panel still works.

- [ ] **Step 6: Final commit (if any uncommitted verification tweaks)**

```bash
git add -A
git commit -m "chore: verification fixes for map toggles and admin data loading"
```

---

## Self-Review Notes

- **Spec coverage:** Bug 1 (limit) → Task 1; Bug 2 (string numerics) → Task 2; Bug 3 (swallowed error) → Task 1 Step 3; `/map` verification → Task 7 Step 5; two-layer toggle → Tasks 3–6; layer-visibility architecture → Task 4; tests → Tasks 1–6; manual verification → Task 7. "API instead of mock" is satisfied by Tasks 1–2 (the runtimeMocks guard test already prevents reintroduction) and verified in Task 7 Step 1.
- **Type consistency:** `ArcgisSceneHandle.setLayerVisibility(visibility: SceneLayerVisibility)` (Task 4 Step 1) is the same signature called in `ArcgisScene` (Task 5) and `createSceneView`'s return (Task 4 Step 4). `buildFloorExtrusions`/`FloorExtrusion`/`DEFAULT_FOOTPRINT_RADIUS_M`/`DEFAULT_FLOOR_HEIGHT_M` (Task 3) match their imports in Task 4. `toNum`/`toNullableNum` are local to `gisMappers.ts`.
- **No new ArcGIS modules:** 3D footprints reuse the already-loaded `Circle`; symbols use autocast `polygon-3d`/`extrude` JSON — so `arcgisSdkLoader.ts` and its test are untouched.
- **Scope:** Single coherent plan (bug fixes + one map feature). No decomposition needed.
