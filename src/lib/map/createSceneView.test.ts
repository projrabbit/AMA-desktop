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
