import type { ApiClient } from '@/lib/api/apiClient';
import type { ShiftItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const shiftEndpoints = {
  list: 'GET /shifts',
  create: 'POST /shifts',
  update: 'PUT /shifts/{shift_id}',
} as const;

export function createShiftService(client: ApiClient = apiClient) {
  return {
    list: (query?: { employee_id?: number }) => client.get<ShiftItem[]>('/shifts', { query }),
    create: (body: Record<string, unknown>) => client.post<ShiftItem>('/shifts', { body }),
    update: (shiftId: number, body: Record<string, unknown>) =>
      client.put<ShiftItem>(`/shifts/${shiftId}`, { body }),
  };
}

export const shiftService = createShiftService();
