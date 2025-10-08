export async function onRequest(context) {
  // Create a new URL object from the original request
  const url = new URL(context.request.url);

  // Set the backend URL
  const backendUrl = 'https://bankconverts-backend-499324155791.asia-south1.run.app';

  // Reconstruct the target URL for the backend
  url.hostname = new URL(backendUrl).hostname;
  url.protocol = 'https';
  url.port = ''; // Ensure port is cleared

  // Create a new request to the backend, preserving method, headers, and body
  const newRequest = new Request(url, context.request);

  // Make the fetch call to the backend
  return fetch(newRequest);
}
