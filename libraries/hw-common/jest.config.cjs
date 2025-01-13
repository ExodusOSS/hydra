// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.js'),
  preset: 'ts-jest/presets/js-with-ts',
  testTimeout: 10_000,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/lib'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  },
}
