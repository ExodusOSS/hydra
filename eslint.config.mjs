import packagePlugin from '@exodus/eslint-plugin-package'
import tsconfigPlugin from '@exodus/eslint-plugin-tsconfig'
import { javascriptBabelPreset, typescriptReactBabelPreset } from '@exodus/eslint-config-exodus'
import markdownParser from '@exodus/eslint-parser-markdown'
import docsPlugin from '@exodus/eslint-plugin-docs'

const ignore = {
  ignores: [
    '**/lib',
    '**/dist',
    '**/tmp',
    '**/node_modules',
    '.claude',
    'tools/generators/**/files',
    'libraries/analytics-validation/src/__tests__/package.json',
    // Folded from per-package eslint configs (fixtures / examples / generated output).
    '**/coverage/**',
    '**/__benchmarks__/**',
    // Intentionally-malformed test inputs for the package/tsconfig/docs rules — these
    // ARE the rules' fixtures. Fixture *source* stays linted (import/named, the only rule
    // that applies to it, never fires on fixtures).
    '**/{fixtures,fixture}/**/{package,tsconfig}.json',
    '**/{fixtures,fixture}/**/*.md',
    '**/__tests__/**/{package,tsconfig}.json',
    // eslint rule-test example inputs carry inline test-only rule directives, so the
    // project linter can't resolve them. (Scoped to lint/ — generic examples stay linted.)
    'lint/**/__tests__/**/examples/**',
    // require-extensions: match its old local config (TS + package.json only; JS examples stay linted).
    'lint/eslint-plugin-require-extensions/example/**/*.{ts,tsx}',
    'lint/eslint-plugin-require-extensions/example/**/package.json',
    'adapters/storage-memory/**/*.d.ts',
    'features/blockchain-metadata/{atoms,module,redux}/**',
    'libraries/i18n-swc/{transform,src}/**',
    'libraries/networking-mobile/{cookie,form,http,url,shared}/**',
    'tools/packages/nx-plugin/src/generators/**/files/**',
    // Repo-level files (not package-scoped — the per-package job never linted these).
    'package.json',
    'README.md',
    'ai/**',
  ],
}

const config = [
  ignore,
  javascriptBabelPreset,
  packagePlugin.configs.recommended,
  tsconfigPlugin.configs.recommended,
  typescriptReactBabelPreset,
  {
    plugins: {
      '@exodus/docs': docsPlugin,
    },
    rules: {
      '@exodus/docs/no-broken-links': 'error',
      '@exodus/docs/mirror-links': [
        'error',
        { mirrors: [{ source: 'ExodusMovement/exodus-hydra', target: 'ExodusOSS/hydra' }] },
      ],
    },
    files: ['**/*.md'],
    ignores: ['**/CHANGELOG.md'],
    languageOptions: { parser: markdownParser },
  },
  {
    files: ['**/*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}'],
    settings: {
      'import/ignore': ['react-native'],
      'import/parsers': {
        '@babel/eslint-parser': ['.js', '.cjs', '.mjs', '.jsx'],
        '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx'],
      },
      'import/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.json', '.ts', '.tsx', '.android.js', '.ios.js'],
        },
      },
    },
  },
  // Per-package overrides folded from the deleted local eslint configs (live rules
  // only). Tracked here the same way oxlint tracks per-path exceptions in
  // .oxlintrc.json overrides.
  {
    // Intentionally pinned (non-caret) dependency ranges.
    files: [
      'libraries/firestore-sync/package.json',
      'libraries/dayjs/package.json',
      'features/fusion/package.json',
      'tools/packages/nx-plugin/package.json', // nx core pinned to match the @nx/* ecosystem
    ],
    rules: { '@exodus/package/permissive-dependencies': 'off' },
  },
  {
    // 0.x / upstream-aligned versions are intentional.
    files: [
      'libraries/axios-replacement/package.json',
      'libraries/metro-react-native-babel-preset/package.json',
      'tools/package.json',
      'tools/packages/vscode-snippets/package.json',
    ],
    rules: { '@exodus/package/package-version': 'off' },
  },
  {
    // Unscoped package names are intentional.
    files: ['libraries/secure-container/package.json', 'libraries/proxy-freeze/package.json'],
    rules: { '@exodus/package/package-name': 'off' },
  },
  {
    // Dummy fixture package — unscoped name + no codeowners entry are intentional.
    files: ['libraries/audit-dummy/package.json'],
    rules: { '@exodus/package/package-name': 'off', '@exodus/package/codeowners': 'off' },
  },
  {
    // main points at a build artifact that doesn't exist at lint time.
    files: ['libraries/i18n-swc/package.json', 'libraries/wallet-connect-bundle/package.json'],
    rules: { '@exodus/package/main-exists': 'off' },
  },
  {
    // Deliberate import-blocker stubs (throw if imported) — package hygiene N/A.
    files: ['tools/you-shall-not-pass/*/package.json'],
    rules: {
      '@exodus/package/required-fields': 'off',
      '@exodus/package/package-version': 'off',
      '@exodus/package/codeowners': 'off',
    },
  },
  {
    files: ['docs/package.json'],
    rules: { '@exodus/package/dont-forget-to-pack': 'off' },
  },
  {
    // Resolver can't follow a dynamic/re-export; was disabled per-package.
    files: ['libraries/push-notifications/**'],
    rules: { 'import/named': 'off' },
  },
  {
    // Not OSS-mirrored (sdk/i18n-babel-webpack), or the only flagged links are a
    // commit-SHA permalink (event-log) / a private-repo PR ref (exchange) that have
    // no correct ExodusOSS/hydra equivalent. The rest were fixed (relative links).
    files: [
      'sdks/wallet-sdk/**',
      'libraries/i18n-babel-webpack/**',
      'features/event-log/**',
      'features/exchange/**',
    ],
    rules: { '@exodus/docs/mirror-links': 'off' },
  },
]

export default config.flat()
