// In functions/api/onRequestPost.js

export async function onRequestPost(context) {
  // 1. Get the backend URL from the environment variable binding.
  const backendUrlHost = context.env.BACKEND_SERVICE_URL;

  // 2. Check if the variable is set.
  if (!backendUrlHost) {
    return new Response("Backend service URL is not configured in Cloudflare Pages settings.", { status: 500 });
  }

  // 3. Construct the full URL to forward the request to.
  let url = new URL(context.request.url);
  let backendUrl = `${backendUrlHost}${url.pathname}${url.search}`;

  // 4. Create a new request object to forward to the backend.
  const backendRequest = new Request(backendUrl, context.request);
  
  // 5. Forward the request and return the backend's response directly.
  return fetch(backendRequest);
}
