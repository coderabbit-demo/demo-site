import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["src/**/*.ts", "src/**/*.tsx"],
  })),
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // React requires async act scopes even when the triggered update is synchronous.
    rules: { "@typescript-eslint/require-await": "off" },
  },
];
