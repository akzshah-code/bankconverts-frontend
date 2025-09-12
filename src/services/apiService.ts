
import { ExtractedTransaction, FinancialAnalysis } from "../lib/types";

const getApiBaseUrl = (): string => {
    // In development mode, use the Vite proxy.
    // All requests to /api will be forwarded to the backend.
    if (import.meta.env.MODE === 'development') {
        return '/api';
    }
    // In production, use the environment variable set by the deployment platform (e.g., Cloudflare Pages).
    return import.meta.env.VITE_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

const handleApiError = (networkError: unknown, apiUrl: string): Error => {
    console.error(`API call to ${apiUrl} failed:`, networkError);

    // This error message is carefully crafted to diagnose common post-deployment issues.
    return new Error(
        `Could not connect to the backend service. This typically means the backend worker crashed.
        <br/><br/>
        <strong>Attempted URL:</strong> <code style="background: #fee2e2; padding: 2px 4px; border-radius: 3px; color: #991b1b;">${apiUrl || 'Not Defined'}</code>
        <br/><br/>
        <strong>Most Common Causes:</strong>
        <ul class="list-disc list-inside mt-1 space-y-1">
            <li>
                <strong style="color: #c2410c;">Missing Backend Secret:</strong> The backend worker is crashing because its <code>API_KEY</code> secret is missing.
                <br/><strong>Action:</strong> Go to your <strong>bankconverts-backend-production</strong> worker in Cloudflare, navigate to <strong>Settings &gt; Bindings</strong>, and ensure the <code>API_KEY</code> secret is correctly bound.
            </li>
             <li>
                <strong style="color: #c2410c;">Deployment Overwriting Bindings:</strong> If you add the binding manually in the dashboard, running <code>npm run deploy</code> will erase it.
                <br/><strong>Permanent Fix:</strong> You MUST create a <code>wrangler.toml</code> file in your <strong>bankconverts-backend</strong> project with the secret binding defined. This makes the setting permanent.
            </li>
            <li>
                <strong>URL Mismatch:</strong> The frontend's <code>VITE_API_BASE_URL</code> variable does not match the worker's URL.
            </li>
        </ul>
        <br/>
        Check your worker's <strong>Logs</strong> in the Cloudflare dashboard for "Exception" errors to confirm a crash.`
    );
};


const handleResponseError = async (response: Response): Promise<Error> => {
    // Check if the server sent a specific HTML error message (like our 503 key error)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        const htmlError = await response.text();
        return new Error(htmlError); // Return the HTML directly for rendering
    }
    
    // Handle JSON errors as before
    let errorText = `Request failed with status ${response.status}`;
    const responseBody = await response.text();
    try {
        const errorData = JSON.parse(responseBody);
        errorText = errorData.error || errorText;
    } catch {
        // The response body was not valid JSON. Use the raw text.
        errorText = responseBody || errorText;
    }
    // Throw the extracted error message from the backend.
    return new Error(errorText);
};

export const checkBackendStatus = async (): Promise<boolean> => {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl && import.meta.env.MODE !== 'development') {
        console.error("VITE_API_BASE_URL is not defined.");
        return false;
    }
    try {
        const response = await fetch(`${baseUrl}/health`);
        return response.ok;
    } catch (error) {
        console.error("Backend health check failed:", error);
        return false;
    }
};


export const extractTransactionsFromApi = async (file: File, password: string | null): Promise<ExtractedTransaction[]> => {
    if (!API_BASE_URL && import.meta.env.MODE !== 'development') {
        throw new Error("Configuration error: VITE_API_BASE_URL is not defined in the frontend environment. Please ensure it is set in your project's .dev.vars file for local development or in your Cloudflare Pages production environment variables.");
    }

    const formData = new FormData();
    formData.append('file', file);
    if (password) {
        formData.append('password', password);
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/convert`, {
            method: 'POST',
            body: formData,
        });
    } catch (networkError) {
        throw handleApiError(networkError, API_BASE_URL);
    }

    if (!response.ok) {
        throw await handleResponseError(response);
    }

    const responseData = await response.json();
    return responseData as ExtractedTransaction[];
};

export const analyzeTransactions = async (transactions: ExtractedTransaction[]): Promise<FinancialAnalysis> => {
    if (!API_BASE_URL && import.meta.env.MODE !== 'development') {
        throw new Error("Configuration error: VITE_API_BASE_URL is not defined.");
    }
     let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions }),
        });
    } catch (networkError) {
        throw handleApiError(networkError, API_BASE_URL);
    }

    if (!response.ok) {
        throw await handleResponseError(response);
    }
    return response.json();
};


export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
    if (!API_BASE_URL) return; // Fail silently for non-critical emails if config is missing
    try {
        await fetch(`${API_BASE_URL}/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        });
    } catch (e) {
        // Log a more informative error, but don't bother the user.
        console.error("Failed to send welcome email:", handleApiError(e, API_BASE_URL).message);
    }
};

export const sendUpgradeEmail = async (name: string, email: string, planName: string): Promise<void> => {
    if (!API_BASE_URL) return;
    try {
        await fetch(`${API_BASE_URL}/send-upgrade-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, planName }),
        });
    } catch (e) {
        console.error("Failed to send upgrade email:", handleApiError(e, API_BASE_URL).message);
    }
};

interface InvoiceEmailPayload {
    name: string;
    email: string;
    planName: string;
    price: string;
    pdfBase64: string;
}

export const sendInvoiceEmail = async (payload: InvoiceEmailPayload): Promise<void> => {
    if (!API_BASE_URL) return;
    try {
        await fetch(`${API_BASE_URL}/send-invoice-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (e) {
        console.error("Failed to send invoice email:", handleApiError(e, API_BASE_URL).message);
    }
};
