import type { ApiClient } from '@/lib/api/apiClient';
import { apiClient } from './apiClientInstance';

export const attendanceEndpoints = {
  exceptions: 'GET /attendance/exceptions',
  detail: 'GET /attendance/{record_id}',
  approve: 'PUT /attendance/{record_id}/approve',
} as const;

export interface AttendanceExceptionParams {
  status?: string;
  reason?: string;
  from?: string;
  to?: string;
  department_id?: number;
  employee_id?: number;
}

export function createAttendanceService(client: ApiClient = apiClient) {
  return {
    exceptions: (query?: AttendanceExceptionParams) =>
      client.get<Record<string, unknown>[]>('/attendance/exceptions', { query }),
    detail: (recordId: number) => client.get<Record<string, unknown>>(`/attendance/${recordId}`),
    approve: (recordId: number, note?: string) =>
      client.put<Record<string, unknown>>(`/attendance/${recordId}/approve`, { body: { note } }),
  };
}

export const attendanceService = createAttendanceService();
