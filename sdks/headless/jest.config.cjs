const { testMatch, ...baseConfig } = require('../../jest.config.js')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...baseConfig,
  rootDir: './',
  setupFiles: ['<rootDir>/__tests__/setup/index.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/http.js'],
  transform: {
    '^.+\\.[mc]?[t|j]s?$': ['babel-jest', { rootMode: 'upward' }],
  },
}
