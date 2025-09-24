const rootConfig = require('../../jest.config')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...rootConfig,
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
}
