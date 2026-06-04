import { beforeEach, describe, expect, it, vi } from 'vitest';

const arcgisMocks = vi.hoisted(() => {
  const createdGraphics: unknown[] = [];
  const createdPoints: unknown[] = [];
  const createdCircles: { center: unknown; radius: number; radiusUnit: string }[] = [];
  const layers: { title: string; visible: boolean; graphics: unknown[]; elevationInfo?: { mode?: string } }[] = [];
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
    sceneViewGoTo: vi.fn(() => Promise.resolve()),
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
  class MockPolygon {
    type = 'polygon';
    rings?: number[][][];
    hasZ?: boolean;
    constructor(options: { rings?: number[][][]; hasZ?: boolean }) {
      Object.assign(this, options);
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
    elevationInfo: { mode?: string } | undefined;
    constructor(options: { title?: string; elevationInfo?: { mode?: string } }) {
      this.title = options?.title ?? '';
      this.elevationInfo = options?.elevationInfo;
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
    goTo = values.sceneViewGoTo;
  }

  return { ...values, MockCircle, MockPolygon, MockGraphic, MockGraphicsLayer, MockMap, MockPoint, MockSceneView, MockWebScene };
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
      Polygon: arcgisMocks.MockPolygon,
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
    // ArcGIS only accepts 'absolute-height' (not 'absolute') for absolute elevation.
    expect(layerByTitle('Tòa nhà 3D')?.elevationInfo?.mode).toBe('absolute-height');

    // Only the geofence is a Circle now; building footprints are extruded box polygons.
    expect(arcgisMocks.createdCircles).toHaveLength(1);
    const extrusions = arcgisMocks.createdGraphics.filter(
      (g) => (g as { symbol?: { type?: string } }).symbol?.type === 'polygon-3d',
    );
    expect(extrusions).toHaveLength(2); // one slab per floor
    const firstGeom = (extrusions[0] as { geometry?: { type?: string; hasZ?: boolean; rings?: number[][][] } }).geometry;
    expect(firstGeom?.type).toBe('polygon');
    expect(firstGeom?.hasZ).toBe(true);
    expect(firstGeom?.rings?.[0]).toHaveLength(5); // closed square ring

    // 1 employee point + 1 building marker point = 2 Point graphics.
    const employeeAndMarkerPoints = arcgisMocks.createdPoints.filter(Boolean);
    expect(employeeAndMarkerPoints).toHaveLength(2);

    // Camera frames the building(s) rather than the env default centre.
    expect(arcgisMocks.sceneViewGoTo).toHaveBeenCalled();
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
