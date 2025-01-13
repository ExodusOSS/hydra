import baseConfig from '../../jest.config.js'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...baseConfig,
  clearMocks: true,
  testMatch: ['**/*.test.js'],
}

export default config
