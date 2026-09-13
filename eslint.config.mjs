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
      // ── Baseline for a codebase that has never actually been linted ──────
      // `next lint` could not read this flat config, so the CI lint step has
      // been exiting on a setup prompt rather than running. Turning it on for
      // the first time surfaces 272 pre-existing errors across ~100 files:
      // 176 no-unused-vars and 92 react/no-unescaped-entities.
      //
      // Those two are held at 'warn' so the gate reports them without failing
      // the build on day one. Everything else — including parse errors and the
      // Next.js correctness rules from next/core-web-vitals — still fails, so
      // the gate is doing real work rather than being switched off. Burn the
      // warnings down and promote these back to 'error'.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'react/no-unescaped-entities': 'warn',

      // Cheap and mechanical, so these stay blocking.
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
