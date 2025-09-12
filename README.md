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

If you see a **"Could not connect to the backend service"** error on your live site, it is almost always caused by one of these two issues:

### 1. Incorrect Frontend URL

The `VITE_API_BASE_URL` in your Cloudflare Pages settings does not exactly match your deployed backend worker's URL.

-   **Check:** Your `npm run deploy` command creates a worker named `bankconverts-backend-production`.
-   **The URL is:** `https://bankconverts-backend-production.your-subdomain.workers.dev`
-   **Fix:** Copy this exact URL and paste it into the `VITE_API_BASE_URL` variable in your **Pages project's production environment settings**.

### 2. Missing Backend Secret

Your `bankconverts-backend-production` worker is crashing because it cannot find the `API_KEY` secret.

-   **Check:** In the Cloudflare dashboard, go to your `bankconverts-backend-production` worker and look under **Settings > Bindings**. It **MUST** show a "Secrets Store" binding for `API_KEY`.
-   **Fix:** The secret may not have been created yet. Run this command in your backend project **once**:
    ```bash
    npx wrangler secret put API_KEY
    ```
    Then, redeploy the backend to apply the binding:
    ```bash
    npm run deploy
    ```
