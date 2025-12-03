// eslint-disable-next-line import/no-extraneous-dependencies
import { javascriptReactBabelPreset } from '@exodus/eslint-config-exodus'
import baseConfig from '../../eslint.config.mjs'

const config = [
  {
    ignores: ['**/fixtures/**/*.js'],
  },
  javascriptReactBabelPreset,
  baseConfig,
  {
    files: ['**/*.{js,ts,jsx,tsx,mjs,mts,cjs,cts}'],
    rules: {
      'unicorn/text-encoding-identifier-case': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: false }],
    },
  },
  {
    files: ['**/*.test.js', 'eslint.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
  {
    files: ['cli/__tests__/extract/fixtures/**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 6,
      sourceType: 'module',

      parserOptions: {
        babelOptions: {
          plugins: [['@babel/plugin-proposal-decorators', { version: 'legacy' }]],
        },
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    rules: {
      '@exodus/docs/mirror-links': 'off',
    },
  },
]

export default config.flat()
