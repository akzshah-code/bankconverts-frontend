# BankConverts: A Split Frontend/Backend Application

This project converts bank statements into structured data using a public React frontend and a private backend powered by Cloudflare Workers and the Google Gemini API. This two-repository setup ensures that proprietary backend logic remains secure.

## Architecture Overview

1.  **`bankconverts-frontend` (This Repository - Public):** A Vite-powered React application that provides the user interface. It is deployed as a **Cloudflare Pages** project.
2.  **`bankconverts-backend` (Separate Private Repository):** A Cloudflare Worker that handles all secure logic, including file processing and communication with the Gemini API. It is deployed as a **Cloudflare Worker**.

---

## Frontend Setup (`bankconverts-frontend`)

> [!IMPORTANT]
> **CRITICAL ACTION REQUIRED: Delete the `/functions` Directory**
>
> Your project contains a `/functions` directory with outdated backend code. If this directory exists when you deploy to Cloudflare Pages, it will **override** the connection to your real backend worker and cause your application to **fail**.
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

### Method 1: Cloudflare Dashboard Setup (Definitive Fix)

This is the most reliable way to configure your worker and resolve all errors.

#### Step 1: Initial Deployment

First, deploy your worker from your command line. **This initial deployment will likely show an error, which is expected.** Its purpose is to create the worker in your Cloudflare account so you can configure it through the dashboard.

```bash
# Make sure you have installed dependencies first
npm install

# Now, run the deploy command. Ignore any errors for now.
npm run deploy
```

#### Step 2: Configure Settings in the Cloudflare Dashboard

Navigate to your worker in the Cloudflare dashboard to add the required settings.

1.  In Cloudflare, go to **Workers & Pages** and select your `bankconverts-backend` worker.
2.  Go to the **Settings** tab.

#### Step 2a: Add the API Key Secret

1.  On the **Settings** page, click on **Variables**.
2.  Scroll down to **Secret variables** and click **Add variable**.
3.  Fill in the fields:
    -   **Variable name:** `API_KEY`
    -   **Value:** Paste your Google Gemini API key here.
4.  Click **Save**.

> **Note:** It is normal for the **Bindings** tab to be empty. Secrets are now handled under **Variables**.

#### Step 2b: Add the Compatibility Flag (Crucial for Fixing Errors)

1.  On the **Settings** page, click on **Runtime**.
2.  Scroll down to **Compatibility Flags** and click **Add flag**.
3.  A text box will appear. Type `nodejs_compat` into the box and press Enter.
4.  Click **Save**.

#### Step 3: Redeploy to Apply Settings

Your settings are saved, but you must redeploy the worker for them to take effect.

1.  Go to the **Deployments** tab for your worker.
2.  Click **Create a deployment**.
3.  Drag and drop your `bankconverts-backend` project folder into the upload box, or simply run the command-line tool again:

```bash
npm run deploy
```

After redeploying with these settings, your backend will be fully configured and your application will work correctly.
