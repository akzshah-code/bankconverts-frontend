// In functions/api/[[path]].js

export async function onRequestPost(context) {
    // Your backend URL
    const BACKEND_URL = "https://bankconverts-backend.iamshahkarimabdul.workers.dev";
  
    let url = new URL(context.request.url);
    let backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
  
    // Log the URL we are about to call
    console.log(`[Proxy] Forwarding request to: ${backendUrl}`);
  
    const backendRequest = new Request(backendUrl, context.request);
    
    try {
      // Make the request to the backend
      const backendResponse = await fetch(backendRequest);
  
      // Log the status code we received from the backend
      console.log(`[Proxy] Received response from backend with status: ${backendResponse.status}`);
  
      // Return the backend's response to the original caller (the frontend)
      return backendResponse;
  
    } catch (error) {
      // Log any errors that occur during the fetch
      console.error("[Proxy] Error fetching from backend:", error);
      return new Response("Proxy failed to connect to backend", { status: 502 });
    }
  }