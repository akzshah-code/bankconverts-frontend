// src/api/api.ts

/**
 * A wrapper for the fetch API that automatically adds the
 * JWT Authorization header to requests if a token is available.
 *
 * If authRequired is true, it will redirect to login if no token is found.
 * It also handles 401 Unauthorized responses by redirecting the user to the login page.
 *
 * @param url The URL to fetch.
 * @param options The standard fetch options object.
 * @param authRequired If true, the request will fail and redirect if no token is present.
 * @returns The fetch Response object.
*/
export async function authorizedFetch(url: string, options: RequestInit = {}, authRequired: boolean = true): Promise<Response | undefined> {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      // --- THIS IS THE FIX ---
      // Only redirect if authentication is explicitly required for this endpoint.
      if (authRequired) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = '/login';
        return;
      }
      // If auth is not required, proceed with the unauthenticated request.
    } else {
        // Add the Authorization header only if the token exists.
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        };
    }
  
    const response = await fetch(url, options);
  
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
      return;
    }
  
    return response;
  }