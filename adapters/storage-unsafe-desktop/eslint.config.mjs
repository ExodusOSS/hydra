import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      '@exodus/docs/mirror-links': 'off',
    },
  },
]

export default config.flat()
