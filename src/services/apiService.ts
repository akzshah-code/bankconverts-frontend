
import { ExtractedTransaction } from "../lib/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const extractTransactionsFromApi = async (file: File, password: string | null): Promise<ExtractedTransaction[]> => {
    if (!API_BASE_URL) {
        throw new Error("Configuration error: VITE_API_BASE_URL is not defined.");
    }

    const formData = new FormData();
    formData.append('file', file);
    if (password) {
        formData.append('password', password);
    }

    const response = await fetch(`${API_BASE_URL}/convert`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let errorText = `Request failed with status ${response.status}`;
        const responseBody = await response.text();
        try {
            const errorData = JSON.parse(responseBody);
            errorText = errorData.error || errorText;
        } catch {
            errorText = responseBody || errorText;
        }
        throw new Error(errorText);
    }

    const responseData = await response.json();
    return responseData as ExtractedTransaction[];
};
