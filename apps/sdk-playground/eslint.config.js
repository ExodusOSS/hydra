import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    languageOptions: {
      globals: {
        fetch: 'readonly',
      },
    },
    rules: {
      '@exodus/package/workspace-dependencies': 'off',
      '@exodus/package/permissive-dependencies': 'off',
      '@exodus/require-extensions/require-extensions': 'off',
    },
  },
  {
    files: ['scripts/**/*.js', '*.config.*', '__tests__/**/*', 'e2e/**/*'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]

export default config.flat()
