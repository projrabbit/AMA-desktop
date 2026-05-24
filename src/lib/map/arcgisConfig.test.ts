import { describe, expect, it } from 'vitest';

import { buildArcgisRuntimeConfig } from './arcgisConfig';

describe('ArcGIS runtime config', () => {
  it('keeps portal, API key, and default camera values', () => {
    const config = buildArcgisRuntimeConfig({
      apiKey: 'abc',
      portalUrl: 'https://portal.example',
      webSceneId: 'scene1',
      defaultCenter: { longitude: 106.7, latitude: 10.77 },
      defaultZoom: 17,
    });

    expect(config.portalUrl).toBe('https://portal.example');
    expect(config.defaultCenter.longitude).toBe(106.7);
  });
});
