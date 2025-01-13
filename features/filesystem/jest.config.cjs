/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...require('../../jest.config.js'),
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
}
