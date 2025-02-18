import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
]

export default config.flat()
