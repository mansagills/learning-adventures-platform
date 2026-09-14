import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Both demo trees are standalone apps with their own package.json (and
    // their own Vercel projects); linting them from here reports findings
    // twice and edits code this project does not own. Same reason demo/ is
    // excluded from tsconfig.json and vitest.config.ts.
    //
    // .agents/ and .claude/ hold agent tooling and skill scripts, not
    // application source.
    ignores: [
      'demo/**',
      'demos/**',
      '.agents/**',
      '.claude/**',
      '.next/**',
      'coverage/**',
      'node_modules/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    // Flat config requires plugins to be registered explicitly. Without this
    // the rule below fails to resolve ("Could not find plugin
    // \"@typescript-eslint\"") and eslint exits before linting anything.
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // These two were held at 'warn' when the lint gate was first switched
      // on (#190), as a deliberate baseline for a codebase that had never
      // actually been linted: 176 no-unused-vars and 92
      // react/no-unescaped-entities, across ~100 files.
      //
      // That baseline has now been paid down (docs/LINT_DEBT.md, phases 1-10),
      // so both are promoted back to 'error' as that config said to do. New
      // violations fail the build rather than accumulating silently again.
      //
      // varsIgnorePattern matches the existing argsIgnorePattern convention:
      // a leading underscore marks something intentionally unused, for
      // variables as well as function arguments.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/no-unescaped-entities': 'error',

      // Cheap and mechanical, so these stay blocking.
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
