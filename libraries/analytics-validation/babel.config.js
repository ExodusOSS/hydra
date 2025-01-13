const schemasafeOptions = require('./schemasafe.config')

module.exports = {
  extends: '../../babel.config.js',
  plugins: [
    // Used just for tests.
    [
      '@exodus/schemasafe-babel-plugin',
      {
        options: [{ globs: ['**/analytics-validation/src/**.schemasafe.json'], schemasafeOptions }],
      },
    ],
  ],
}
