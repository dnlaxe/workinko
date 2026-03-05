// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,

  {
    files: ["**/*.{ts,js}", "public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  prettierConfig,
);
