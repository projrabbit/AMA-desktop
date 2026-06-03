import { beforeEach, describe, expect, it, vi } from 'vitest';

const arcgisMocks = vi.hoisted(() => {
  const createdGraphics: unknown[] = [];
  const createdPoints: unknown[] = [];
  const createdCircles: unknown[] = [];
  const values = {
    config: {},
    createdCircles,
    createdGraphics,
    createdPoints,
    destroy: vi.fn(),
    graphicsLayerAddMany: vi.fn(),
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
    constructor(options: unknown) {
      createdCircles.push(options);
    }
  }

  class MockGraphicsLayer {
    constructor(public options: unknown) {}
    addMany = values.graphicsLayerAddMany;
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

  return {
    ...values,
    MockCircle,
    MockGraphic,
    MockGraphicsLayer,
    MockMap,
    MockPoint,
    MockSceneView,
    MockWebScene,
  };
});

vi.mock('./arcgisSdkLoader', () => ({
  loadArcgisCoreModules: arcgisMocks.loadArcgisCoreModules,
}));

vi.mock('@arcgis/core/config', () => ({ default: arcgisMocks.config }));
vi.mock('@arcgis/core/Graphic', () => ({ default: arcgisMocks.MockGraphic }));
vi.mock('@arcgis/core/geometry/Point', () => ({ default: arcgisMocks.MockPoint }));
vi.mock('@arcgis/core/geometry/Circle', () => ({ default: arcgisMocks.MockCircle }));
vi.mock('@arcgis/core/layers/GraphicsLayer', () => ({ default: arcgisMocks.MockGraphicsLayer }));
vi.mock('@arcgis/core/Map', () => ({ default: arcgisMocks.MockMap }));
vi.mock('@arcgis/core/WebScene', () => ({ default: arcgisMocks.MockWebScene }));
vi.mock('@arcgis/core/views/SceneView', () => ({ default: arcgisMocks.MockSceneView }));

import { createSceneView } from './createSceneView';

describe('createSceneView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    arcgisMocks.createdCircles.length = 0;
    arcgisMocks.createdGraphics.length = 0;
    arcgisMocks.createdPoints.length = 0;
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

  it('loads ArcGIS through the CDN loader and renders API-driven 3D context', async () => {
    await createSceneView({
      container: document.createElement('div'),
      config: {
        apiKey: '',
        portalUrl: 'https://www.arcgis.com',
        webSceneId: '',
        defaultCenter: { longitude: 106.700981, latitude: 10.776889 },
        defaultZoom: 17,
      },
      points: [
        {
          id: 'employee-1',
          longitude: 106.701,
          latitude: 10.777,
          altitude: 24,
          title: 'Anna',
          description: 'Ops',
        },
      ],
      buildings: [
        {
          id: 'building-1',
          name: 'AMA Tower',
          longitude: 106.700981,
          latitude: 10.776889,
          address: 'Q1',
          arcgisLayerId: 'ama-building-layer',
          floors: [{ id: 'floor-1', name: 'Tầng 1', altitudeMin: 15, altitudeMax: 22 }],
        },
      ],
      geofences: [
        {
          id: 'geofence-1',
          name: 'Sảnh chính',
          longitude: 106.7009,
          latitude: 10.7768,
          radiusMeters: 30,
          altitudeMin: 15,
          altitudeMax: 22,
          isActive: true,
        },
      ],
    });

    expect(arcgisMocks.loadArcgisCoreModules).toHaveBeenCalledTimes(1);
    expect(arcgisMocks.map).toHaveBeenCalledWith({ basemap: 'osm' });
    expect(arcgisMocks.webScene).not.toHaveBeenCalled();
    expect(arcgisMocks.createdPoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ longitude: 106.701, latitude: 10.777, z: 24 }),
        expect.objectContaining({ longitude: 106.700981, latitude: 10.776889, z: 15 }),
      ]),
    );
    expect(arcgisMocks.createdCircles).toEqual([
      expect.objectContaining({ center: [106.7009, 10.7768], radius: 30, radiusUnit: 'meters' }),
    ]);
    expect(arcgisMocks.createdGraphics).toHaveLength(3);
    expect(arcgisMocks.graphicsLayerAddMany).toHaveBeenCalledWith(expect.any(Array));
  });
});
