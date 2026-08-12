import { fileURLToPath } from "url";
import { dirname } from "path";
import typescriptEslint from "typescript-eslint";
import tsdoc from "eslint-plugin-tsdoc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildEslintConfig(dirname) {
  return [
    js.configs.recommended,
    eslintConfigPrettier,
    ...typescriptEslint.configs.recommended,
    {
      ignores: ["**/*.d.ts", "**/*.config.js", "dist"],
    },
    {
      plugins: {
        "@typescript-eslint": typescriptEslint.plugin,
        tsdoc,
      },

      languageOptions: {
        parser: typescriptEslint.parser,
        sourceType: "script",

        parserOptions: {
          project: ["./tsconfig.json"],
          tsconfigRootDir: dirname,
        },
      },

      rules: {
        "tsdoc/syntax": "warn",
        indent: "off",
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "no-constant-condition": ["error", { checkLoops: false }],
        "@typescript-eslint/no-namespace": "off",
      },
    },
    {
      files: ["tests/**/*.mjs"],
      languageOptions: {
        sourceType: "module",
        parserOptions: {
          project: false,
        },
      },
    },
  ];
}

export default buildEslintConfig(__dirname);
