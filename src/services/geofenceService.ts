import type { ApiClient } from '@/lib/api/apiClient';
import type { GeofenceItem, MessageData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const geofenceEndpoints = {
  list: 'GET /geofences/',
  create: 'POST /geofences/',
  update: 'PUT /geofences/{geofence_id}',
  disable: 'DELETE /geofences/{geofence_id}',
} as const;

export interface ListGeofencesParams {
  building_id?: number;
  floor_id?: number;
  is_active?: boolean;
}

export function createGeofenceService(client: ApiClient = apiClient) {
  return {
    list: (query?: ListGeofencesParams) => client.get<GeofenceItem[]>('/geofences/', { query }),
    create: (body: Partial<GeofenceItem>) => client.post<GeofenceItem>('/geofences/', { body }),
    update: (geofenceId: number, body: Partial<GeofenceItem>) =>
      client.put<GeofenceItem>(`/geofences/${geofenceId}`, { body }),
    disable: (geofenceId: number) => client.delete<MessageData>(`/geofences/${geofenceId}`),
  };
}

export const geofenceService = createGeofenceService();
