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
  goTo(target: unknown, options?: unknown): Promise<void>;
}

const METERS_PER_DEGREE_LAT = 111_320;

// Square footprint (closed ring) centred on the building, with each vertex at
// baseZ so the floor slab extrudes upward from its real altitude. Buildings read
// as boxes, not cylinders. The API has no real footprint polygon, so we use a
// fixed half-width.
function buildFootprintRing(
  longitude: number,
  latitude: number,
  baseZ: number,
  halfMeters: number,
): number[][] {
  const dLat = halfMeters / METERS_PER_DEGREE_LAT;
  const dLng = halfMeters / (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180));
  return [
    [longitude - dLng, latitude - dLat, baseZ],
    [longitude + dLng, latitude - dLat, baseZ],
    [longitude + dLng, latitude + dLat, baseZ],
    [longitude - dLng, latitude + dLat, baseZ],
    [longitude - dLng, latitude - dLat, baseZ],
  ];
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
  const { config: esriConfig, Graphic, Point, Circle, Polygon, GraphicsLayer, Map: ArcgisMap, WebScene, SceneView } =
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
    // 'absolute-height' places each floor at its real baseZ so floors stack;
    // ArcGIS rejects the bare value 'absolute'.
    elevationInfo: { mode: 'absolute-height' },
  }) as GraphicsLayerLike;
  // Employee locations are the page's primary purpose: always visible, no toggle.
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
          geometry: new Polygon({
            rings: [buildFootprintRing(building.longitude, building.latitude, floor.baseZ, DEFAULT_FOOTPRINT_RADIUS_M)],
            spatialReference: { wkid: 4326 },
            hasZ: true,
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
  // Building markers belong to the geofence/overlay view, so they share the geofence toggle.
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

  // Frame the building(s) instead of the env default centre, which may be far away.
  // animate:false keeps it deterministic across the scene's periodic data refreshes.
  if (buildings.length > 0) {
    const lngs = buildings.map((b) => b.longitude);
    const lats = buildings.map((b) => b.latitude);
    const center = [
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
      (Math.min(...lats) + Math.max(...lats)) / 2,
    ];
    const zoom = buildings.length === 1 ? 18 : 16;
    await view.goTo({ center, zoom, tilt: 55 }, { animate: false }).catch(() => undefined);
  }

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
