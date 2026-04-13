module.exports = {
  ...require('../../jest.config'),
  testTimeout: 10_000,
  setupFiles: ['./jest.setup-globals.cjs'],
}
