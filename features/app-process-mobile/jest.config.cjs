// eslint-disable-next-line import/no-extraneous-dependencies
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../tsconfig.json')

const rootConfig = require('../../jest.config')

const { collectCoverage, coverageReporters, reporters } = rootConfig

const untranspiledModulePatterns = [
  'p-defer',
  '@exodus/atoms',
  '@exodus/basic-utils',
  '@exodus/zod',
]

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage,
  transformIgnorePatterns: [
    `node_modules/(?!((jest-)?react-native|@react-native(-community)?|${untranspiledModulePatterns.join(
      '|'
    )})/)`,
  ],
  transform: {
    '^.+\\.(mjs)$': 'babel-jest',
  },
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
  testMatch: ['**/__tests__/**/*.test.?(m)[jt]s?(x)'],
}
