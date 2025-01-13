module.exports = {
  parser: 'babel-eslint',
  extends: ['prettier/flowtype', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
  globals: {
    // for Jest
    test: false,
    expect: false,
    jest: false,
    beforeAll: false,
  },
}
