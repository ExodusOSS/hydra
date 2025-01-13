module.exports = {
  ...require('../../jest.config'),
  preset: 'ts-jest/presets/js-with-ts',
  testTimeout: 10_000,
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}
