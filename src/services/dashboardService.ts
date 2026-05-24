import type { ApiClient } from '@/lib/api/apiClient';
import type { DashboardSummaryData } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const dashboardEndpoints = { summary: 'GET /dashboard/summary' } as const;

export function createDashboardService(client: ApiClient = apiClient) {
  return {
    summary: (date?: string) => client.get<DashboardSummaryData>('/dashboard/summary', { query: { date } }),
  };
}

export const dashboardService = createDashboardService();
