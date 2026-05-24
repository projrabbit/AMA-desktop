import type { ApiClient } from '@/lib/api/apiClient';
import type { BuildingItem, FloorItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const buildingEndpoints = {
  list: 'GET /buildings/',
  create: 'POST /buildings/',
  update: 'PUT /buildings/{building_id}',
  floors: 'GET /buildings/{building_id}/floors',
  createFloor: 'POST /buildings/{building_id}/floors',
  updateFloor: 'PUT /floors/{floor_id}',
} as const;

export interface ListBuildingsParams {
  q?: string;
  include_floors?: boolean;
}

export function createBuildingService(client: ApiClient = apiClient) {
  return {
    list: (query?: ListBuildingsParams) => client.get<BuildingItem[]>('/buildings/', { query }),
    create: (body: Partial<BuildingItem>) => client.post<BuildingItem>('/buildings/', { body }),
    update: (buildingId: number, body: Partial<BuildingItem>) =>
      client.put<BuildingItem>(`/buildings/${buildingId}`, { body }),
    listFloors: (buildingId: number) => client.get<FloorItem[]>(`/buildings/${buildingId}/floors`),
    createFloor: (buildingId: number, body: Partial<FloorItem>) =>
      client.post<FloorItem>(`/buildings/${buildingId}/floors`, { body }),
    updateFloor: (floorId: number, body: Partial<FloorItem>) =>
      client.put<FloorItem>(`/floors/${floorId}`, { body }),
  };
}

export const buildingService = createBuildingService();
