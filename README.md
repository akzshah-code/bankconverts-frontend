# BankConverts: A Split Frontend/Backend Application

This project converts bank statements into structured data using a public React frontend and a private backend powered by Cloudflare Workers and the Google Gemini API. This two-repository setup ensures that proprietary backend logic remains secure.

## Architecture Overview

1.  **`bankconverts-frontend` (This Repository - Public):** A Vite-powered React application that provides the user interface. It is deployed as a **Cloudflare Pages** project.
2.  **`bankconverts-backend` (Separate Private Repository):** A Cloudflare Worker that handles all secure logic, including file processing and communication with the Gemini API. It is deployed as a **Cloudflare Worker**.

---

## Frontend Setup (`bankconverts-frontend`)

### Important: Project Cleanup

Your project contains an unused `/functions` directory. This was likely from an earlier project structure. To prevent build errors and keep your project aligned with the two-repository architecture, it is highly recommended that you **delete the entire `functions` directory** from your `bankconverts-frontend` project before deploying to Cloudflare Pages.

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
   - `VITE_API_BASE_URL`: `https://bankconverts-backend.iamshahkarimabdul.workers.dev`
   - `VITE_RAZORPAY_KEY_ID`: Your production Razorpay Key ID.

---

## Backend Setup (`bankconverts-backend`)

Follow these instructions in your separate, **private** `bankconverts-backend` repository.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Environment Variables

The backend worker needs your secure Google Gemini API key.

a. In the root of the *backend* project, create a file named `.dev.vars`.

b. Add your secret key.

```
# .dev.vars (in backend project)

API_KEY=PASTE_YOUR_GOOGLE_GEMINI_API_KEY_HERE
```

### 3. Run the Development Server

This command starts the local Wrangler server for your backend API.

```bash
npm run dev
```

Your backend API should now be running at `http://127.0.0.1:8787`.

### 4. Deployment to Cloudflare Workers

a. **First-time deployment:**
   ```bash
   npm run deploy
   ```
   This will publish your worker and create a public URL.

b. **Set Production Secret:** Your `API_KEY` must be set as a secret in the Cloudflare dashboard, not as a plaintext environment variable.
   ```bash
   npx wrangler secret put API_KEY
   ```
   You will be prompted to paste your secret key. This ensures it is encrypted and securely available to your live worker.