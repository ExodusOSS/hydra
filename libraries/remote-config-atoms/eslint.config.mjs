import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],

    rules: {
      'unicorn/no-useless-undefined': 'off',
    },
  },
]

export default config.flat()
