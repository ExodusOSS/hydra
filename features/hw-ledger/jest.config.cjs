const runUnitTests = process.env.RUN_TESTS === 'unit' || !process.env.RUN_TESTS
const runIntegrationTests = process.env.RUN_TESTS === 'integration' || !process.env.RUN_TESTS

const testMatch = []

// move this logic up?
if (runUnitTests && runIntegrationTests) {
  testMatch.push('**/__tests__/**/*.test.?([cm])js')
} else if (runIntegrationTests) {
  testMatch.push('**/__tests__/**/*.integration.test.?([cm])js')
} else {
  testMatch.push(
    '**/__tests__/**/*.test.?([cm])js',
    '!**/__tests__/**/*.integration.test.?([cm])js'
  )
}

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.js'),
  testMatch,
}
