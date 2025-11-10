// src/api/api.ts

/**
 * apiFetch: Fetch with optional auth.
 * - Adds Authorization header if a token exists in localStorage.
 * - Sends cookies (credentials: 'include') for cookie-based auth.
 * - If auth='required' and a 401 occurs, redirect to /login (no alerts).
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  auth: 'optional' | 'required' = 'optional'
): Promise<Response> {
  const token = localStorage.getItem('accessToken'); // single source of truth

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (auth === 'required' && response.status === 401) {
    // No blocking alert. Just route to login.
    window.location.href = '/login';
  }

  return response;
}
