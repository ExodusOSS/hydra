import baseConfig from '../../eslint.config.mjs'

const config = [
  {
    ignores: ['__tests__/fixture/**/*'],
  },
  baseConfig,
]

export default config.flat()
