module.exports = {
  ...require('../../jest.config.js'),
  preset: 'ts-jest/presets/js-with-ts-esm',
  testTimeout: 10_000,
  testEnvironment: 'node',
}
