export interface RawArcgisEnv {
  VITE_ARCGIS_API_KEY?: string;
  VITE_ARCGIS_PORTAL_URL?: string;
  VITE_ARCGIS_WEBSCENE_ID?: string;
  VITE_ARCGIS_DEFAULT_CENTER_LNG?: string;
  VITE_ARCGIS_DEFAULT_CENTER_LAT?: string;
  VITE_ARCGIS_DEFAULT_ZOOM?: string;
}

export interface RawAuthEnv {
  VITE_BYPASS_LOGIN?: string;
}

export interface ArcgisAppConfig {
  apiKey: string;
  portalUrl: string;
  webSceneId: string;
  defaultCenter: {
    longitude: number;
    latitude: number;
  };
  defaultZoom: number;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_PORTAL_URL = 'https://www.arcgis.com';
const DEFAULT_LNG = 106.700981;
const DEFAULT_LAT = 10.776889;
const DEFAULT_ZOOM = 17;

export function getApiBaseUrl(rawBaseUrl = import.meta.env.VITE_API_BASE_URL): string {
  const trimmed = (rawBaseUrl || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getArcgisConfig(env: RawArcgisEnv = import.meta.env as RawArcgisEnv): ArcgisAppConfig {
  return {
    apiKey: env.VITE_ARCGIS_API_KEY?.trim() ?? '',
    portalUrl: env.VITE_ARCGIS_PORTAL_URL?.trim() || DEFAULT_PORTAL_URL,
    webSceneId: env.VITE_ARCGIS_WEBSCENE_ID?.trim() ?? '',
    defaultCenter: {
      longitude: parseNumber(env.VITE_ARCGIS_DEFAULT_CENTER_LNG, DEFAULT_LNG),
      latitude: parseNumber(env.VITE_ARCGIS_DEFAULT_CENTER_LAT, DEFAULT_LAT),
    },
    defaultZoom: parseNumber(env.VITE_ARCGIS_DEFAULT_ZOOM, DEFAULT_ZOOM),
  };
}

export function isLoginBypassEnabled(rawFlag: string | undefined): boolean {
  return rawFlag?.trim().toLowerCase() === 'true';
}

/**
 * Chế độ demo dùng dữ liệu mẫu tức thì, không gọi backend.
 * Bật bằng VITE_USE_MOCK=true (xem trước giao diện khi chưa chạy AMA-server).
 */
export function isMockMode(rawFlag: string | undefined = import.meta.env.VITE_USE_MOCK): boolean {
  return rawFlag?.trim().toLowerCase() === 'true';
}
