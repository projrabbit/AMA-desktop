import type { ApiFailure, ApiResponse, ApiSuccess, RefreshData } from '@/types/api';
import { getApiBaseUrl } from '@/lib/config/env';
import { ApiError } from './apiErrors';
import { browserTokenStorage, type TokenStorage } from './tokenStorage';

export { ApiError } from './apiErrors';

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  query?: object;
  body?: unknown;
  signal?: AbortSignal;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  tokenStorage?: TokenStorage;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  post<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  put<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  delete<T>(path: string, options?: RequestOptions): Promise<ApiSuccess<T>>;
  upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<ApiSuccess<T>>;
  download(path: string, options?: RequestOptions): Promise<Blob>;
}

function createSearchParams(query?: RequestOptions['query']): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (!query) {
    return searchParams;
  }

  for (const [key, value] of Object.entries(query as Record<string, QueryValue | QueryValue[]>)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== null && item !== undefined && item !== '') {
        searchParams.append(key, String(item));
      }
    }
  }

  return searchParams;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const href = `${cleanBaseUrl}${cleanPath}`;
  const search = createSearchParams(query).toString();

  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(href)) {
    return search ? `${href}${href.includes('?') ? '&' : '?'}${search}` : href;
  }

  const url = new URL(href);
  for (const [key, value] of createSearchParams(query)) {
    url.searchParams.append(key, value);
  }
  return url.toString();
}

function isFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.success === false;
}

async function parseJsonEnvelope<T>(response: Response): Promise<ApiResponse<T> | null> {
  const contentType = response.headers.get('Content-Type') ?? '';
  return contentType.includes('application/json') ? ((await response.json()) as ApiResponse<T>) : null;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = options.baseUrl ?? getApiBaseUrl();
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  const tokenStorage = options.tokenStorage ?? browserTokenStorage;

  async function refreshAccessToken(): Promise<boolean> {
    const tokens = tokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      return false;
    }

    try {
      const response = await rawRequest<RefreshData>('POST', '/auth/refresh', {
        body: { refresh_token: tokens.refreshToken },
        skipAuth: true,
        skipRefresh: true,
      });
      tokenStorage.updateAccessToken(response.data.access_token);
      return true;
    } catch {
      tokenStorage.clearTokens();
      return false;
    }
  }

  async function send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchImpl(url, init);
    } catch (error) {
      throw new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Network error',
        details: error,
      });
    }
  }

  async function rawRequest<T>(
    method: string,
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<ApiSuccess<T>> {
    const headers = new Headers();
    const tokens = tokenStorage.getTokens();

    if (!requestOptions.skipAuth && tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    let body: BodyInit | undefined;
    if (requestOptions.body instanceof FormData) {
      body = requestOptions.body;
    } else if (requestOptions.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(requestOptions.body);
    }

    const response = await send(buildUrl(baseUrl, path, requestOptions.query), {
      method,
      headers,
      body,
      signal: requestOptions.signal,
    });

    const json =
      (await parseJsonEnvelope<T>(response)) ??
      ({ success: true, data: undefined as T } satisfies ApiSuccess<T>);

    if (response.status === 401 && !requestOptions.skipRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawRequest<T>(method, path, { ...requestOptions, skipRefresh: true });
      }
      tokenStorage.clearTokens();
    }

    if (!response.ok || isFailure(json)) {
      const error = isFailure(json)
        ? json.error
        : { code: response.status === 403 ? 'FORBIDDEN' : 'HTTP_ERROR', message: response.statusText };
      throw new ApiError({
        status: response.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    return json;
  }

  async function download(path: string, requestOptions: RequestOptions = {}): Promise<Blob> {
    const headers = new Headers();
    const tokens = tokenStorage.getTokens();
    if (!requestOptions.skipAuth && tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }

    const response = await send(buildUrl(baseUrl, path, requestOptions.query), {
      method: 'GET',
      headers,
      signal: requestOptions.signal,
    });

    const json = await parseJsonEnvelope<Blob>(response);

    if (response.status === 401 && !requestOptions.skipRefresh) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return download(path, { ...requestOptions, skipRefresh: true });
      }
      tokenStorage.clearTokens();
    }

    if (!response.ok || (json && isFailure(json))) {
      const error = json && isFailure(json) ? json.error : { code: 'HTTP_ERROR', message: response.statusText };
      throw new ApiError({
        status: response.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    return response.blob();
  }

  return {
    get: <T>(path: string, requestOptions?: RequestOptions) =>
      rawRequest<T>('GET', path, requestOptions),
    post: <T>(path: string, requestOptions?: RequestOptions) =>
      rawRequest<T>('POST', path, requestOptions),
    put: <T>(path: string, requestOptions?: RequestOptions) =>
      rawRequest<T>('PUT', path, requestOptions),
    delete: <T>(path: string, requestOptions?: RequestOptions) =>
      rawRequest<T>('DELETE', path, requestOptions),
    upload: <T>(path: string, formData: FormData, requestOptions?: RequestOptions) =>
      rawRequest<T>('POST', path, { ...requestOptions, body: formData }),
    download,
  };
}
