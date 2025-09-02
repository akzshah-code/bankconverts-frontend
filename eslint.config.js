import globals from "globals";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // 1. Global Ignores:
  // This section tells ESLint to completely ignore files in these directories.
  // It's crucial for performance and to avoid linting compiled code or dependencies.
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".wrangler/**",
      "functions/**", // Ignores the backend serverless functions.
    ],
  },

  // 2. Global Language Options:
  // Sets up the environment for your source code.
  {
    linterOptions: {
      // Warns about unused 'eslint-disable' comments, helping keep the codebase clean.
      reportUnusedDisableDirectives: "warn",
    },
    languageOptions: {
      // Defines global variables available in your environment (e.g., 'window', 'document').
      globals: {
        ...globals.browser, // Standard browser globals.
        ...globals.node,    // Node.js globals (useful for Vite/tooling configs).
      },
    },
  },

  // 3. TypeScript Configuration:
  // Applies the recommended rules from the official TypeScript ESLint plugin.
  ...tseslint.configs.recommended,

  // 4. React-Specific Configuration:
  // This block targets only JSX and TSX files to apply React-specific rules.
  {
    files: ["**/*.{jsx,tsx}"],
    ...eslintReact.configs.recommended,
    rules: {
      ...eslintReact.configs.recommended.rules,
      // It's best practice to disable prop-types validation in a TypeScript project
      // because TypeScript already provides stronger type checking for props.
      "react/prop-types": "off",
    },
  },

  // 5. Vite HMR Support (React Refresh):
  // This configures the lint rule for Vite's Hot Module Replacement (HMR).
  // It ensures your components are structured correctly for fast refresh to work.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // 6. Prettier Compatibility (MUST BE LAST):
  // This disables any ESLint rules that might conflict with Prettier's formatting.
  // This lets Prettier handle all code formatting, while ESLint focuses on code quality.
  prettierConfig
);