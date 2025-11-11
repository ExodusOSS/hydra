import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    languageOptions: {
      globals: {
        chrome: true,
      },
    },
    rules: {
      'unicorn/prefer-logical-operator-over-ternary': 'off',
    },
  },
  {
    files: ['test/**/*.js'],
    rules: {
      '@exodus/require-extensions/require-extensions': 'off',
      '@exodus/require-extensions/require-index': 'off',
    },
  },
  {
    files: ['**/*.[tj]s'],
    rules: {
      'unicorn/prefer-string-starts-ends-with': 'off',
    },
  },
]

export default config.flat()
