
# BankConverts: A Split Frontend/Backend Application

This project converts bank statements into structured data using a public React frontend and a private backend powered by Cloudflare Workers and the Google Gemini API. This two-repository setup ensures that proprietary backend logic remains secure.

## Architecture Overview

1.  **`bankconverts-frontend` (This Repository - Public):** A Vite-powered React application that provides the user interface. It is deployed as a **Cloudflare Pages** project.
2.  **`bankconverts-backend` (Separate Private Repository):** A Cloudflare Worker that handles all secure logic, including file processing and communication with the Google Gemini API. It is deployed as a **Cloudflare Worker**.

---

## Frontend Setup (`bankconverts-frontend`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Environment Variables

The frontend needs to know the URL of your local backend server and your Razorpay key.

a. In the root of *this* project, create a new file named `.dev.vars`.

b. Add the following variables.

```
# .dev.vars (in frontend project)

# The local URL of your backend worker (started with `npm run dev` in the backend project)
VITE_API_BASE_URL=http://127.0.0.1:8787

# Your public Razorpay Key ID
VITE_RAZORPAY_KEY_ID=PASTE_YOUR_RAZORPAY_KEY_ID_HERE
```
> **Note:** The `VITE_` prefix is required by Vite to expose these variables to your application code.

### 3. Run the Development Server

This command starts the Vite development server for the frontend application.

```bash
npm run dev
```

Your frontend should now be running at `http://localhost:5174`.

### 4. Deployment to Cloudflare Pages

a. In the Cloudflare dashboard, create a new **Pages** project and connect it to this GitHub repository.

b. **Configure Build Settings:**
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

c. **Set Production Environment Variables:**
   - Go to your Pages project **Settings > Environment variables**.
   - Add the following variables for the **Production** environment:
     - `VITE_API_BASE_URL`: The full URL of your deployed production worker (e.g., `https://bankconverts-backend-production.your-subdomain.workers.dev`).
     - `VITE_RAZORPAY_KEY_ID`: Your production Razorpay Key ID.

---

## Backend Setup (`bankconverts-backend`)

Follow these instructions in your separate, **private** `bankconverts-backend` repository.

### 1. Install & Configure

```bash
# Install dependencies
npm install

# Create local environment file
touch .dev.vars

# Add your Gemini API key to .dev.vars for local development
echo 'API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"' >> .dev.vars
```

### 2. Run Locally

This starts your backend worker at `http://127.0.0.1:8787`.

```bash
npm run dev
```

### 3. Deploy to Cloudflare

This two-step process is all you need to deploy. The `wrangler.toml` file automatically handles the secret binding.

**Step 3a: Set the Production Secret (One-Time Setup)**

This command securely stores your Gemini API key in your Cloudflare account. It only needs to be run once.

```bash
npx wrangler secret put API_KEY
```
When prompted, paste your API key and press Enter.

**Step 3b: Deploy the Worker**

This command publishes your worker to Cloudflare. It will automatically connect the `API_KEY` secret every time.

```bash
npm run deploy
```

---

## 🚨 Troubleshooting: "Conversion Failed" Error

If you see a **"Could not connect to the backend service"** error on your live site, it means the backend worker is crashing. This crash prevents the server from sending the required CORS headers, causing the browser to block the connection.

This is almost always caused by one of these two issues:

### 1. Missing or Invalid Backend Secret (Most Likely)

Your `bankconverts-backend-production` worker is crashing because it cannot find a valid `API_KEY`.

-   **The Problem:** The backend needs this secret to function. If it's missing, the worker crashes immediately. A crashed worker cannot send the correct CORS headers, which is why your browser shows a generic "Could not connect" error.

-   **The Deployment Loop Trap:** If you add the `API_KEY` binding manually in the Cloudflare dashboard, it will work temporarily. However, the next time you run `npm run deploy` from your computer, **it will delete the manual binding**. This is because the command line is the "source of truth," and without a local configuration file, it assumes no bindings should exist.

-   **The Permanent Fix:**
    1.  Ensure you have run `npx wrangler secret put API_KEY` at least once in your backend project to store the secret in Cloudflare.
    2.  Create a file named `wrangler.toml` in the root of your **`bankconverts-backend`** project. This file is the permanent instruction manual for deployments.
    3.  Paste the correct configuration into this file (see the backend setup guide or a provided example). This configuration explicitly tells Wrangler to attach the `API_KEY` every single time.
    4.  Run `npm run deploy` again. The binding will now be applied automatically and will no longer be deleted.

### 2. Incorrect Frontend URL

The `VITE_API_BASE_URL` in your Cloudflare Pages settings does not exactly match your deployed backend worker's URL.

-   **Check:** Your `npm run deploy` command creates a worker named `bankconverts-backend-production`.
-   **The URL is:** `https://bankconverts-backend-production.your-subdomain.workers.dev`
-   **Fix:** Copy this exact URL and paste it into the `VITE_API_BASE_URL` variable in your **Pages project's production environment settings**.
