import { ExtractedTransaction } from "../lib/types";

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

const handleApiError = (networkError: unknown): Error => {
    console.error("API call failed:", networkError);
    // This type of error often indicates a CORS problem or the backend server being down/misconfigured.
    return new Error(
        `Could not connect to the backend service. This may be due to a network issue or a server configuration problem.<br/><br/>
        Common causes:
        <ul class="list-disc list-inside mt-1">
         <li>The backend worker is not deployed or has crashed (e.g., due to a missing <strong>API_KEY</strong> secret).</li>
         <li>The <strong>VITE_API_BASE_URL</strong> is incorrect in the frontend environment.</li>
         <li>A Cross-Origin (CORS) issue.</li>
        </ul>
        <br/>Please check the browser's developer console and backend logs for more details.`
    );
};

const handleResponseError = async (response: Response): Promise<Error> => {
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


export const extractTransactionsFromApi = async (file: File, password: string | null): Promise<ExtractedTransaction[]> => {
    if (!API_BASE_URL) {
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
        throw handleApiError(networkError);
    }

    if (!response.ok) {
        throw await handleResponseError(response);
    }

    const responseData = await response.json();
    return responseData as ExtractedTransaction[];
};

export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
    if (!API_BASE_URL) return; // Fail silently for non-critical emails if config is missing
    await fetch(`${API_BASE_URL}/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
};

export const sendUpgradeEmail = async (name: string, email: string, planName: string): Promise<void> => {
    if (!API_BASE_URL) return;
    await fetch(`${API_BASE_URL}/send-upgrade-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, planName }),
    });
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
    await fetch(`${API_BASE_URL}/send-invoice-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
};