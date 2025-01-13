module.exports = {
  ...require('../../jest.config'),
  preset: 'ts-jest',
  testTimeout: 10_000,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib'],
}
