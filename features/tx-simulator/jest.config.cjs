// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig')
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.js'),
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  modulePathIgnorePatterns: ['<rootDir>/lib'],
  preset: 'ts-jest/presets/js-with-babel-esm',
  testEnvironment: 'node',
  testTimeout: 10_000,
}
