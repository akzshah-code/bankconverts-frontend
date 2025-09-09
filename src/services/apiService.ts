import { ExtractedTransaction } from "../lib/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        console.error("API call failed:", networkError);
        // This type of error often indicates a CORS problem or the backend server being down/misconfigured.
        throw new Error(
            `Could not connect to the backend service. This may be due to a network issue or a server configuration problem.<br/><br/>
            Common causes:
            <ul class="list-disc list-inside mt-1">
             <li>The backend worker is not deployed or has crashed (e.g., due to a missing <strong>API_KEY</strong> secret).</li>
             <li>The <strong>VITE_API_BASE_URL</strong> is incorrect in the frontend environment.</li>
             <li>A Cross-Origin (CORS) issue.</li>
            </ul>
            <br/>Please check the browser's developer console and backend logs for more details.`
        );
    }


    if (!response.ok) {
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
        throw new Error(errorText);
    }

    const responseData = await response.json();
    return responseData as ExtractedTransaction[];
};