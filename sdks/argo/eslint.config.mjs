import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]

export default config.flat()
