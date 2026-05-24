import { describe, expect, it } from 'vitest';

import type { ApiClient } from '@/lib/api/apiClient';
import type { ApiSuccess } from '@/types/api';
import { authEndpoints, createAuthService } from './authService';
import { buildingEndpoints, createBuildingService } from './buildingService';
import { geofenceEndpoints, createGeofenceService } from './geofenceService';
import { reportEndpoints, createReportService } from './reportService';

function createFakeClient() {
  const calls: string[] = [];

  function response<T>(): Promise<ApiSuccess<T>> {
    return Promise.resolve({ success: true, data: {} as T });
  }

  const client: ApiClient = {
    get: <T,>(path: string) => {
      calls.push(`GET ${path}`);
      return response<T>();
    },
    post: <T,>(path: string) => {
      calls.push(`POST ${path}`);
      return response<T>();
    },
    put: <T,>(path: string) => {
      calls.push(`PUT ${path}`);
      return response<T>();
    },
    delete: <T,>(path: string) => {
      calls.push(`DELETE ${path}`);
      return response<T>();
    },
    upload: <T,>(path: string) => {
      calls.push(`UPLOAD ${path}`);
      return response<T>();
    },
    download: (path: string) => {
      calls.push(`DOWNLOAD ${path}`);
      return Promise.resolve(new Blob());
    },
  };

  return { client, calls };
}

describe('service endpoint notes', () => {
  it('documents confirmed endpoints', () => {
    expect(authEndpoints.login).toBe('POST /auth/login');
    expect(buildingEndpoints.list).toBe('GET /buildings/');
    expect(geofenceEndpoints.disable).toBe('DELETE /geofences/{geofence_id}');
    expect(reportEndpoints.exportAttendance).toBe('GET /reports/attendance/export');
  });

  it('calls auth endpoints', async () => {
    const { client, calls } = createFakeClient();
    const authService = createAuthService(client);
    await authService.login({ username: 'linh.tran@example.com', password: 'Admin@2026' });
    await authService.me();
    expect(calls).toEqual(['POST /auth/login', 'GET /auth/me']);
  });

  it('keeps OpenAPI trailing slashes for building and geofence list endpoints', async () => {
    const { client, calls } = createFakeClient();
    await createBuildingService(client).list({ include_floors: true });
    await createGeofenceService(client).list({ is_active: true });
    expect(calls).toEqual(['GET /buildings/', 'GET /geofences/']);
  });

  it('uses binary download for report export', async () => {
    const { client, calls } = createFakeClient();
    await createReportService(client).exportAttendance({
      format: 'pdf',
      from: '2026-05-01',
      to: '2026-05-24',
    });
    expect(calls).toEqual(['DOWNLOAD /reports/attendance/export']);
  });
});
