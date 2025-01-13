/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig')

module.exports = {
  ...require('../../jest.config.js'),
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest/presets/js-with-ts',
  testTimeout: 10_000,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
}
