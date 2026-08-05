/**
 * Shared API client.
 *
 * Every mutating request must carry the CSRF token the server issued as a
 * readable cookie, and every request must send credentials so the auth cookie
 * travels cross-origin (the frontend is on Vercel, the API on Render). Doing
 * this in one place means a new call site cannot forget and get a 403.
 */

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

/** Methods the server exempts from CSRF verification. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Serialised as JSON unless it is already a FormData/string body. */
  body?: unknown;
  /** Aborts the request after this many milliseconds. */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Performs a request and parses the JSON response.
 * Throws {@link ApiError} on any non-2xx status so callers can branch on
 * `error.status` instead of checking `res.ok` at every call site.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;
  const method = (rest.method ?? 'GET').toUpperCase();

  const finalHeaders = new Headers(headers);

  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (!SAFE_METHODS.has(method)) {
    const token = readCookie(CSRF_COOKIE);
    if (token) finalHeaders.set(CSRF_HEADER, token);
  }

  // A hung request should surface as an error rather than a spinner that never
  // resolves — Render free tier cold starts can take several seconds.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      method,
      headers: finalHeaders,
      credentials: 'include',
      signal: rest.signal ?? controller.signal,
      body:
        body === undefined
          ? undefined
          : isFormData || typeof body === 'string'
            ? (body as BodyInit)
            : JSON.stringify(body),
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }
    throw new ApiError('Network error — please check your connection', 0);
  }
  clearTimeout(timeout);

  const requestId = response.headers.get('X-Request-Id') ?? undefined;

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed with status ${response.status}`;

    throw new ApiError(
      message,
      response.status,
      payload && typeof payload === 'object' ? (payload as any).details : undefined,
      requestId,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/**
 * Ensures a CSRF cookie exists before the first mutating request.
 *
 * The token is issued on any `/api` response, but the app's first action after
 * load may be a POST (e.g. Google sign-in on a fresh browser), so we prime it.
 */
export async function primeCsrfToken(): Promise<void> {
  if (readCookie(CSRF_COOKIE)) return;
  try {
    await fetch('/api/health', { credentials: 'include' });
  } catch {
    // Offline or the API is down — the next real request surfaces the error.
  }
}
