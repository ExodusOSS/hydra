import baseConfig from '../../../../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]

export default config.flat()
