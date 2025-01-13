import baseConfig from '../../jest.config.js'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...baseConfig,
  testTimeout: 10_000,
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}

export default config
