import type { ApiClient, QueryValue } from '@/lib/api/apiClient';
import type { AuditLogItem, AuditLogListData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const auditLogEndpoints = {
  list: 'GET /audit-logs/',
  detail: 'GET /audit-logs/{log_id}',
} as const;

export function createAuditLogService(client: ApiClient = apiClient) {
  return {
    list: (query?: Record<string, QueryValue>) => client.get<AuditLogListData>('/audit-logs/', { query }),
    detail: (logId: number) => client.get<AuditLogItem>(`/audit-logs/${logId}`),
  };
}

export const auditLogService = createAuditLogService();
