import type { ApiClient } from '@/lib/api/apiClient';
import type { EmployeeInfo, MessageData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const employeeEndpoints = {
  list: 'GET /employees',
  create: 'POST /employees',
  detail: 'GET /employees/{employee_id}',
  update: 'PUT /employees/{employee_id}',
  deactivate: 'PUT /employees/{employee_id}/deactivate',
  assignShift: 'PUT /employees/{employee_id}/shift',
  registerFace: 'POST /employees/{employee_id}/face',
  faceStatus: 'GET /employees/{employee_id}/face',
  deleteFace: 'DELETE /employees/{employee_id}/face',
} as const;

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  q?: string;
  department_id?: number;
  status?: string;
}

export function createEmployeeService(client: ApiClient = apiClient) {
  return {
    list: (query?: EmployeeListParams) => client.get<EmployeeInfo[]>('/employees', { query }),
    create: (body: Record<string, unknown>) => client.post<EmployeeInfo>('/employees', { body }),
    detail: (employeeId: number) => client.get<EmployeeInfo>(`/employees/${employeeId}`),
    update: (employeeId: number, body: Record<string, unknown>) =>
      client.put<EmployeeInfo>(`/employees/${employeeId}`, { body }),
    deactivate: (employeeId: number, reason?: string) =>
      client.put<MessageData>(`/employees/${employeeId}/deactivate`, { body: { reason } }),
    assignShift: (employeeId: number, shiftId: number) =>
      client.put<MessageData>(`/employees/${employeeId}/shift`, { body: { shift_id: shiftId } }),
    registerFace: (employeeId: number, formData: FormData) =>
      client.upload<Record<string, unknown>>(`/employees/${employeeId}/face`, formData),
    faceStatus: (employeeId: number) =>
      client.get<Record<string, unknown>>(`/employees/${employeeId}/face`),
    deleteFace: (employeeId: number) =>
      client.delete<Record<string, unknown>>(`/employees/${employeeId}/face`),
  };
}

export const employeeService = createEmployeeService();
