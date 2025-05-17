// eslint.config.js
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "unused-imports": eslintPluginUnusedImports,
    },
    rules: {
      ...prettier.rules,
      "prettier/prettier": "error",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);
