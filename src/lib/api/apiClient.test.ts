import { describe, expect, it, vi } from 'vitest';

import { ApiError, createApiClient } from './apiClient';
import { createMemoryTokenStorage } from './tokenStorage';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
    ...init,
  });
}

describe('api client', () => {
  it('parses success envelopes and query params', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { ok: true } }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    const result = await client.get<{ ok: boolean }>('/dashboard/summary', {
      query: { date: '2026-05-24', empty: null },
    });

    expect(result.data.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/dashboard/summary?date=2026-05-24',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws Vietnamese API errors for backend failures', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid' } },
        { status: 401 },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    await expect(client.get('/auth/me')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      userMessage: 'Email hoặc mật khẩu không đúng.',
    });
  });

  it('refreshes once on 401 and retries with new access token', async () => {
    const tokenStorage = createMemoryTokenStorage({ accessToken: 'old', refreshToken: 'refresh' });
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'No' } },
          { status: 401 },
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { access_token: 'new', token_type: 'bearer', expires_in: 3600 },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { account_id: 1 } }));

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api/v1',
      fetchImpl,
      tokenStorage,
    });
    const result = await client.get<{ account_id: number }>('/auth/me');

    expect(result.data.account_id).toBe(1);
    expect(tokenStorage.getTokens()?.accessToken).toBe('new');
  });

  it('supports multipart uploads without forcing JSON headers', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { uploaded: true } }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });
    const formData = new FormData();
    formData.set('face_image', new Blob(['x']), 'face.jpg');

    await client.upload('/employees/1/face', formData);

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(init.body).toBe(formData);
    expect(new Headers(init.headers).has('Content-Type')).toBe(false);
  });

  it('supports binary downloads', async () => {
    const blob = new Blob(['report']);
    const fetchImpl = vi.fn().mockResolvedValue(new Response(blob, { status: 200 }));
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    const result = await client.download('/reports/attendance/export', {
      query: { format: 'pdf', from: '2026-05-01', to: '2026-05-24' },
    });

    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThan(0);
  });

  it('preserves backend error codes for binary download failures', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
        { status: 403 },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://localhost:8000/api/v1', fetchImpl });

    await expect(client.download('/reports/attendance/export')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      userMessage: 'Bạn không có quyền thực hiện thao tác này.',
    });
  });

  it('supports relative API base URLs for same-origin deployments', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: { ok: true } }));
    const client = createApiClient({ baseUrl: '/api/v1', fetchImpl });

    await client.get('/auth/me', { query: { from: 'dashboard' } });

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/v1/auth/me?from=dashboard',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('ApiError', () => {
  it('keeps status, code, and user message', () => {
    const error = new ApiError({ status: 403, code: 'FORBIDDEN', message: 'Forbidden' });
    expect(error.status).toBe(403);
    expect(error.userMessage).toBe('Bạn không có quyền thực hiện thao tác này.');
  });
});
