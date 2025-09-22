// In functions/api/onRequestPost.js

export async function onRequestPost(context) {
  // Check if the BACKEND_SERVICE binding exists.
  if (!context.env.BACKEND_SERVICE) {
    return new Response("Backend service binding not configured.", { status: 500 });
  }

  // Forward the incoming request directly to the bound backend service.
  // Cloudflare handles all the routing and networking automatically.
  return context.env.BACKEND_SERVICE.fetch(context.request);
}
