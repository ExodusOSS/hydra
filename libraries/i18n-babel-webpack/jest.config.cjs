/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.js'),
  transform: {
    '^.+\\.[t|j]s?$': ['babel-jest', { rootMode: 'upward' }],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}
