import type { ApiClient } from '@/lib/api/apiClient';
import { apiClient } from './apiClientInstance';

export const fraudEndpoints = {
  records: 'GET /fraud/records',
  detail: 'GET /fraud/records/{fraud_id}',
} as const;

export function createFraudService(client: ApiClient = apiClient) {
  return {
    records: () => client.get<Record<string, unknown>[]>('/fraud/records'),
    detail: (fraudId: number) => client.get<Record<string, unknown>>(`/fraud/records/${fraudId}`),
  };
}

export const fraudService = createFraudService();
