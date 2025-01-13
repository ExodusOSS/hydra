module.exports = {
  // https://jestjs.io/docs/en/configuration#testmatch-array-string
  ...require('../../jest.config.js'),
  verbose: true,
  testTimeout: 10_000,
}
