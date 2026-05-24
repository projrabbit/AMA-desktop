import type { ApiClient } from '@/lib/api/apiClient';
import type { AttendanceReportData, ExportFormat } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const reportEndpoints = {
  attendance: 'GET /reports/attendance',
  exportAttendance: 'GET /reports/attendance/export',
} as const;

export interface AttendanceReportParams {
  from: string;
  to: string;
  department_id?: number;
  employee_id?: number;
}

export interface AttendanceExportParams extends AttendanceReportParams {
  format: ExportFormat;
}

export function createReportService(client: ApiClient = apiClient) {
  return {
    attendance: (query: AttendanceReportParams) =>
      client.get<AttendanceReportData>('/reports/attendance', { query }),
    exportAttendance: (query: AttendanceExportParams) =>
      client.download('/reports/attendance/export', { query }),
  };
}

export const reportService = createReportService();
