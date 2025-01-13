/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig.json')

const rootConfig = require('../../jest.config')

const { collectCoverage, coverageReporters, reporters } = rootConfig

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage,
  coverageReporters,
  reporters,
  preset: 'react-native',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/lib'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
  testEnvironment: 'jsdom',
}
