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
