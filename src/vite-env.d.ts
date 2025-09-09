import 'vite/client';

declare global {
  // Define the structure of `import.meta.env` for type safety.
  interface ImportMetaEnv {
    readonly VITE_RAZORPAY_KEY_ID: string;
    readonly VITE_API_BASE_URL: string;
    // FIX: Add Vite's built-in MODE variable to the type definition to resolve the error in apiService.ts.
    // FIX: Removed readonly modifier to resolve conflicting type declarations for MODE.
    MODE: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// This empty export is required to ensure this file is treated as a module.
export {};