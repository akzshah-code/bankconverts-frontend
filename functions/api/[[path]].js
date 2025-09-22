// In functions/api/[[path]].js

// Use the specific handler for POST requests
export async function onRequestPost(context) {
    // Replace this with the actual URL of your deployed Flask backend
    const BACKEND_URL = "https://bankconverts-backend.iamshahkarimabdul.workers.dev";
  
    let url = new URL(context.request.url);
    let backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
  
    const backendRequest = new Request(backendUrl, context.request);
    
    return fetch(backendRequest);
  }
  