// In functions/api/[[path]].js

export async function onRequest(context) {
  // Get the backend URL from the environment variable.
  const backendUrlHost = context.env.BACKEND_SERVICE_URL;

  // Check if the variable is configured in your Cloudflare Pages settings.
  if (!backendUrlHost) {
    return new Response("Backend service URL not configured.", { status: 500 });
  }

  // Reconstruct the full backend URL.
  const url = new URL(context.request.url);
  const backendUrl = `${backendUrlHost}${url.pathname}${url.search}`;

  // Create a new request to forward to the backend,
  // preserving the original method, headers, and body.
  const backendRequest = new Request(backendUrl, context.request);
  
  // Forward the request and return the backend's response.
  return fetch(backendRequest);
}
