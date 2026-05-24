import type { ApiClient } from '@/lib/api/apiClient';
import type { RealtimeLocationItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const realtimeEndpoints = { locations: 'GET /realtime/employees-location' } as const;

export interface RealtimeLocationParams {
  building_id?: number;
  floor_id?: number;
  department_id?: number;
}

export function createRealtimeService(client: ApiClient = apiClient) {
  return {
    locations: (query?: RealtimeLocationParams) =>
      client.get<RealtimeLocationItem[]>('/realtime/employees-location', { query }),
  };
}

export const realtimeService = createRealtimeService();
