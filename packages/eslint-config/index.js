/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        ecmaVersion: "latest",
        project: true,
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];