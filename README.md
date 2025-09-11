# BankConverts: A Split Frontend/Backend Application

This project converts bank statements into structured data using a public React frontend and a private backend powered by Cloudflare Workers and the Google Gemini API. This two-repository setup ensures that proprietary backend logic remains secure.

## Architecture Overview

1.  **`bankconverts-frontend` (This Repository - Public):** A Vite-powered React application that provides the user interface. It is deployed as a **Cloudflare Pages** project.
2.  **`bankconverts-backend` (Separate Private Repository):** A Cloudflare Worker that handles all secure logic, including file processing and communication with the Google Gemini API. It is deployed as a **Cloudflare Worker**.

---

## Frontend Setup (`bankconverts-frontend`)

> [!IMPORTANT]
> **CRITICAL ACTION REQUIRED: Delete the `/functions` Directory**
>
> Your project may contain a `/functions` directory with outdated backend code. If this directory exists when you deploy to Cloudflare Pages, it will **override** the connection to your real backend worker and cause your application to **fail**.
>
> **You must delete the entire `/functions` directory from this frontend project.**
>
> This is the most common cause of deployment issues.

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
     - `VITE_API_BASE_URL`: `https://your-worker-name.your-subdomain.workers.dev` (replace with your actual worker URL)
     - `VITE_RAZORPAY_KEY_ID`: Your production Razorpay Key ID.

---

## Backend Setup (`bankconverts-backend`)

Follow these instructions in your separate, **private** `bankconverts-backend` repository.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local API Key
For local development, your worker needs the Gemini API key.

a. In the root of your `bankconverts-backend` project, create a file named `.dev.vars`.
b. Add your key:
```
# .dev.vars (in backend project)
API_KEY="PASTE_YOUR_GEMINI_API_KEY_HERE"
```
> **Note:** This file is for local development only and should be in your `.gitignore`.

### 3. Run Locally
This starts your backend worker at `http://127.0.0.1:8787`.
```bash
npm run dev
```

### 4. Deploy to Cloudflare (Simplified & Reliable)

This two-step process is all you need to deploy. The new `wrangler.toml` file automatically handles the secret binding, preventing it from being accidentally removed.

**Step 4a: Set the Production Secret (One-Time Setup)**

This command securely stores your Gemini API key in your Cloudflare account. It only needs to be run once.

```bash
npx wrangler secret put API_KEY
```
When prompted, paste your API key and press Enter.

**Step 4b: Deploy the Worker**

This command will publish your worker to Cloudflare. Thanks to the `wrangler.toml` file, it will automatically connect the `API_KEY` secret every time.

```bash
npm run deploy
```

Your backend is now live and correctly configured. You no longer need to manually check or add bindings in the Cloudflare dashboard after deploying.