import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { includeTypes: false }],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]

export default config.flat()
