module.exports = {
  ...require('../../jest.config'),
  preset: 'ts-jest/presets/js-with-ts',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testTimeout: 10_000,
  modulePathIgnorePatterns: ['<rootDir>/lib'],
  forceExit: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.[mc]?js?$': ['babel-jest', { rootMode: 'upward' }],
  },
}
