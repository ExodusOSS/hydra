import fs from 'node:fs'
import hydraPlugin from '@exodus/eslint-plugin-hydra'
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
    'tools/generators/**/files',
    'libraries/analytics-validation/src/__tests__/package.json',
  ],
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const isModule = pkg.type === 'module'
const esmConfigs = isModule ? hydraPlugin.configs.esm : []

const config = [
  ignore,
  javascriptBabelPreset,
  hydraPlugin.configs.recommended,
  hydraPlugin.configs.features,
  packagePlugin.configs.recommended,
  tsconfigPlugin.configs.recommended,
  typescriptReactBabelPreset,
  esmConfigs,
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
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.json', '.ts', '.tsx', '.android.js', '.ios.js'],
        },
      },
    },
    rules: {
      '@exodus/hydra/forbidden-redux-dependencies': ['error', { modules: ['uiConfig'] }],
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/text-encoding-identifier-case': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['lodash', 'lodash/*', 'lodash.*', 'lodash-es'],
              message: 'Prefer @exodus/basic-utils to lodash, if possible',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**/*.{ts,js}', '**/*.{spec,test}.{ts,js}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]

export default config.flat()
