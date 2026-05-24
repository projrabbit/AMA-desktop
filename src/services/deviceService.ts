import type { ApiClient } from '@/lib/api/apiClient';
import type { DeviceItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const deviceEndpoints = {
  list: 'GET /devices',
  trust: 'PUT /devices/{device_id}/trust',
  me: 'GET /devices/me',
} as const;

export interface DeviceListParams {
  employee_id?: number;
  is_trusted?: boolean;
  platform?: string;
  page?: number;
  limit?: number;
}

export function createDeviceService(client: ApiClient = apiClient) {
  return {
    list: (query?: DeviceListParams) => client.get<DeviceItem[]>('/devices', { query }),
    trust: (deviceId: number, isTrusted: boolean) =>
      client.put<DeviceItem>(`/devices/${deviceId}/trust`, { body: { is_trusted: isTrusted } }),
    me: () => client.get<DeviceItem[]>('/devices/me'),
  };
}

export const deviceService = createDeviceService();
