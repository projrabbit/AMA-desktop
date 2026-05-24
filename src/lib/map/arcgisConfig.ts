import { getArcgisConfig, type ArcgisAppConfig } from '@/lib/config/env';

export type ArcgisRuntimeConfig = ArcgisAppConfig;

export function buildArcgisRuntimeConfig(
  config: ArcgisAppConfig = getArcgisConfig(),
): ArcgisRuntimeConfig {
  return config;
}
