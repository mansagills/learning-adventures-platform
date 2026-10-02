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
    //
    // games-src/ holds standalone game projects with their own toolchain;
    // their built bundles land in public/games/<name>/ and are minified
    // output, not source.
    ignores: [
      'demo/**',
      'demos/**',
      'games-src/**',
      'public/games/seeds-of-genius/**',
      'public/games/play/**',
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
  {
    // The public site uses its own icon set (UX-1): SiteIcon for content and
    // UiIcon for controls, both in components/icons/. Stock icon packs stay
    // available to the hidden account pages only.
    files: [
      'components/{home,play,books,demo,blog,newsletter}/**/*.{ts,tsx}',
      'components/{Header,Footer,ContentPage}.tsx',
      'app/{page,not-found}.tsx',
      'app/{games,subjects,books,demo,blog,newsletter,about,privacy,terms}/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react',
              message:
                'Public pages use the Learning Adventures icons: UiIcon for controls, SiteIcon for everything else (components/icons/).',
            },
          ],
          patterns: [
            {
              group: ['**/components/Icon', './Icon'],
              message:
                'Public pages use UiIcon or SiteIcon (components/icons/) instead of the old Icon component.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
