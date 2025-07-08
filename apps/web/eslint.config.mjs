import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import shared from "../../packages/eslint-config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...shared,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
