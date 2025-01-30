import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const fileName = fileURLToPath(import.meta.url);
const directoryName = dirname(fileName);

const compat = new FlatCompat({
  baseDirectory: directoryName,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      quotes: ['error', 'single', { avoidEscape: false }],
      semi: ['error', 'always'],
    },
  }),
];

export default eslintConfig;
