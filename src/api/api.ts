/**
 * A wrapper for the fetch API that automatically adds the
 * JWT Authorization header to requests.
 *
 * It retrieves the token from localStorage and throws an error if it's not found.
 * It also handles 401 Unauthorized responses by redirecting the user to the login page.
 *
 * @param url The URL to fetch.
 * @param options The standard fetch options object.
 * @returns The fetch Response object.
 */
export async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response | undefined> {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      // If there's no token, redirect to login immediately.
      alert('You are not logged in. Redirecting to login page.');
      window.location.href = '/login';
      return;
    }
  
    // Add the Authorization header to the request.
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  
    const response = await fetch(url, options);
  
    // If the token is expired or invalid, the server will return 401.
    if (response.status === 401) {
      // Clear the expired token and redirect to login.
      localStorage.removeItem('accessToken');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
      return;
    }
  
    return response;
  }
  