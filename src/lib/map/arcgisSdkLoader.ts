export const ARCGIS_CDN_URL = 'https://js.arcgis.com/5.0/';
export const ARCGIS_CSS_URL = 'https://js.arcgis.com/5.0/esri/themes/light/main.css';

const MODULE_IDS = [
  '@arcgis/core/config.js',
  '@arcgis/core/Graphic.js',
  '@arcgis/core/geometry/Point.js',
  '@arcgis/core/geometry/Circle.js',
  '@arcgis/core/geometry/Polygon.js',
  '@arcgis/core/layers/GraphicsLayer.js',
  '@arcgis/core/Map.js',
  '@arcgis/core/WebScene.js',
  '@arcgis/core/views/SceneView.js',
] as const;

type ArcgisConstructor = new (options?: unknown) => unknown;

export interface ArcgisCoreModules {
  config: { apiKey?: string; portalUrl?: string };
  Graphic: ArcgisConstructor;
  Point: ArcgisConstructor;
  Circle: ArcgisConstructor;
  Polygon: ArcgisConstructor;
  GraphicsLayer: ArcgisConstructor;
  Map: ArcgisConstructor;
  WebScene: ArcgisConstructor;
  SceneView: ArcgisConstructor;
}

let modulesPromise: Promise<ArcgisCoreModules> | null = null;

function ensureArcgisCss() {
  if (document.querySelector(`link[href="${ARCGIS_CSS_URL}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = ARCGIS_CSS_URL;
  document.head.append(link);
}

function ensureArcgisScript(): Promise<void> {
  if (window.$arcgis?.import) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${ARCGIS_CDN_URL}"]`);
  const script = existing ?? document.createElement('script');
  script.type = 'module';
  script.src = ARCGIS_CDN_URL;

  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('ARCGIS_SDK_LOAD_FAILED')), { once: true });

    if (!existing) {
      document.head.append(script);
    }
  });
}

export function loadArcgisCoreModules(): Promise<ArcgisCoreModules> {
  modulesPromise ??= (async () => {
    ensureArcgisCss();
    await ensureArcgisScript();

    if (!window.$arcgis?.import) {
      throw new Error('ARCGIS_IMPORT_UNAVAILABLE');
    }

    const [config, Graphic, Point, Circle, Polygon, GraphicsLayer, Map, WebScene, SceneView] =
      await window.$arcgis.import<unknown[]>([...MODULE_IDS]);

    return {
      config: config as ArcgisCoreModules['config'],
      Graphic: Graphic as ArcgisConstructor,
      Point: Point as ArcgisConstructor,
      Circle: Circle as ArcgisConstructor,
      Polygon: Polygon as ArcgisConstructor,
      GraphicsLayer: GraphicsLayer as ArcgisConstructor,
      Map: Map as ArcgisConstructor,
      WebScene: WebScene as ArcgisConstructor,
      SceneView: SceneView as ArcgisConstructor,
    };
  })();

  return modulesPromise;
}
