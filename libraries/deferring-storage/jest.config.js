import baseConfig from '../../jest.config.js'

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...baseConfig,
  preset: 'ts-jest/presets/js-with-ts-esm',
  testTimeout: 10_000,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}

export default config
