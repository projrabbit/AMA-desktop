import { describe, expect, it } from 'vitest';

import { getApiBaseUrl, getArcgisConfig, isLoginBypassEnabled } from './env';

describe('environment helpers', () => {
  it('adds /api/v1 when the base URL is only the backend host', () => {
    expect(getApiBaseUrl('http://localhost:8000')).toBe('http://localhost:8000/api/v1');
  });

  it('does not duplicate /api/v1 when it is already present', () => {
    expect(getApiBaseUrl('http://localhost:8000/api/v1/')).toBe('http://localhost:8000/api/v1');
  });

  it('falls back to localhost when the API base URL is empty', () => {
    expect(getApiBaseUrl('')).toBe('http://localhost:8000/api/v1');
  });

  it('normalizes ArcGIS numeric config', () => {
    const config = getArcgisConfig({
      VITE_ARCGIS_API_KEY: 'key',
      VITE_ARCGIS_PORTAL_URL: 'https://example.portal',
      VITE_ARCGIS_WEBSCENE_ID: 'abc123',
      VITE_ARCGIS_DEFAULT_CENTER_LNG: '106.7',
      VITE_ARCGIS_DEFAULT_CENTER_LAT: '10.77',
      VITE_ARCGIS_DEFAULT_ZOOM: '16',
    });

    expect(config.defaultCenter).toEqual({ longitude: 106.7, latitude: 10.77 });
    expect(config.defaultZoom).toBe(16);
  });

  it('enables login bypass only when the flag is true', () => {
    expect(isLoginBypassEnabled('true')).toBe(true);
    expect(isLoginBypassEnabled(' TRUE ')).toBe(true);
    expect(isLoginBypassEnabled('false')).toBe(false);
    expect(isLoginBypassEnabled(undefined)).toBe(false);
  });
});
