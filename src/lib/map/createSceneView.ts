import type { ArcgisRuntimeConfig } from './arcgisConfig';
import { loadArcgisCoreModules } from './arcgisSdkLoader';
import type { ArcgisSceneHandle, MapBuilding, MapGeofence, MapPoint } from './types';

export interface CreateSceneViewOptions {
  container: HTMLDivElement;
  config: ArcgisRuntimeConfig;
  points?: MapPoint[];
  buildings?: MapBuilding[];
  geofences?: MapGeofence[];
}

interface GraphicsLayerLike {
  addMany(graphics: unknown[]): void;
}

interface MapLike {
  add(layer: unknown): void;
}

interface ViewLike {
  destroy(): void;
  when(): Promise<void>;
}

function floorSummary(building: MapBuilding): string {
  if (!building.floors || building.floors.length === 0) {
    return 'Chưa có dữ liệu tầng.';
  }

  return building.floors
    .map((floor) => `${floor.name}: ${floor.altitudeMin}-${floor.altitudeMax} m`)
    .join('<br />');
}

export async function createSceneView({
  container,
  config,
  points = [],
  buildings = [],
  geofences = [],
}: CreateSceneViewOptions): Promise<ArcgisSceneHandle> {
  const { config: esriConfig, Graphic, Point, Circle, GraphicsLayer, Map: ArcgisMap, WebScene, SceneView } =
    await loadArcgisCoreModules();

  if (config.apiKey) {
    esriConfig.apiKey = config.apiKey;
  }
  esriConfig.portalUrl = config.portalUrl;

  const graphicsLayer = new GraphicsLayer({ title: 'Dữ liệu chấm công 3D AMA' }) as GraphicsLayerLike;
  const graphics = [
    ...geofences.map(
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
    ...buildings.map(
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
    ...points.map(
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
  ];

  graphicsLayer.addMany(graphics);

  const map = config.webSceneId
    ? new WebScene({ portalItem: { id: config.webSceneId } })
    : new ArcgisMap({ basemap: 'osm' });

  (map as MapLike).add(graphicsLayer);

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
  };
}
