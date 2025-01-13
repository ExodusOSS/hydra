import rootConfig from '../../jest.config.js'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...rootConfig,
  transform: {
    '^.+\\.[mc]?[t|j]s?$': ['babel-jest', { rootMode: 'upward' }],
  },
}

export default config
