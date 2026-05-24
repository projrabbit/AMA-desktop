import type { ApiClient } from '@/lib/api/apiClient';
import type { DepartmentItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const departmentEndpoints = {
  list: 'GET /departments',
  create: 'POST /departments',
  update: 'PUT /departments/{department_id}',
} as const;

export function createDepartmentService(client: ApiClient = apiClient) {
  return {
    list: (query?: { q?: string; page?: number; limit?: number }) =>
      client.get<DepartmentItem[]>('/departments', { query }),
    create: (body: Record<string, unknown>) => client.post<DepartmentItem>('/departments', { body }),
    update: (departmentId: number, body: Record<string, unknown>) =>
      client.put<DepartmentItem>(`/departments/${departmentId}`, { body }),
  };
}

export const departmentService = createDepartmentService();
