import { beforeEach, describe, expect, it, vi } from 'vitest';

function setArcgisImport(importImpl: ReturnType<typeof vi.fn>) {
  window.$arcgis = { import: importImpl };
}

describe('arcgis SDK loader', () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = '';
    delete window.$arcgis;
  });

  it('uses the existing ArcGIS CDN global without injecting another script', async () => {
    const importImpl = vi.fn().mockResolvedValue(['config', 'Graphic', 'Point', 'Circle', 'Polygon', 'GraphicsLayer', 'Map', 'WebScene', 'SceneView']);
    setArcgisImport(importImpl);
    const { loadArcgisCoreModules } = await import('./arcgisSdkLoader');

    const modules = await loadArcgisCoreModules();

    expect(importImpl).toHaveBeenCalledWith([
      '@arcgis/core/config.js',
      '@arcgis/core/Graphic.js',
      '@arcgis/core/geometry/Point.js',
      '@arcgis/core/geometry/Circle.js',
      '@arcgis/core/geometry/Polygon.js',
      '@arcgis/core/layers/GraphicsLayer.js',
      '@arcgis/core/Map.js',
      '@arcgis/core/WebScene.js',
      '@arcgis/core/views/SceneView.js',
    ]);
    expect(modules.Map).toBe('Map');
    expect(document.querySelectorAll('script[src="https://js.arcgis.com/5.0/"]')).toHaveLength(0);
  });

  it('injects CDN script and CSS once while sharing concurrent loads', async () => {
    const { loadArcgisCoreModules } = await import('./arcgisSdkLoader');

    const first = loadArcgisCoreModules();
    const second = loadArcgisCoreModules();
    const script = document.querySelector<HTMLScriptElement>('script[src="https://js.arcgis.com/5.0/"]');
    const importImpl = vi.fn().mockResolvedValue(['config', 'Graphic', 'Point', 'Circle', 'Polygon', 'GraphicsLayer', 'Map', 'WebScene', 'SceneView']);

    expect(script).not.toBeNull();
    expect(script?.type).toBe('module');
    expect(document.querySelectorAll('link[href="https://js.arcgis.com/5.0/esri/themes/light/main.css"]')).toHaveLength(1);

    setArcgisImport(importImpl);
    script?.dispatchEvent(new Event('load'));

    await expect(first).resolves.toMatchObject({ SceneView: 'SceneView' });
    await expect(second).resolves.toMatchObject({ SceneView: 'SceneView' });
    expect(importImpl).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('script[src="https://js.arcgis.com/5.0/"]')).toHaveLength(1);
  });
});
