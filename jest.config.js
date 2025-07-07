const path = require('path')

/** @type {import('@jest/types').Config.InitialOptions} */
const CI_CONFIG = {
  reporters: ['summary', 'github-actions'],
  coverageReporters: ['json-summary', 'text-summary', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
const DEV_CONFIG = {
  coverageReporters: ['json-summary', 'text-summary', 'lcov', 'json'],
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testMatch: ['**/__tests__/**/*.test.?([cm])[jt]s?(x)', '**/?(*.)+(spec|test).?([cm])[jt]s?(x)'],
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')],
  collectCoverage: false,
  testTimeout: 10_000,
  bail: true,
  forceExit: true,
  ...(process.env.CI === 'true' ? CI_CONFIG : DEV_CONFIG),
}

// Integration tests are not run by default, opt-in via env flag
if (process.env.RUN_TESTS === 'integration') {
  module.exports.testMatch = ['**/__tests__/**/*.integration-test.?([cm])[jt]s?(x)']
}
