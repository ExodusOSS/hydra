module.exports = {
  extends: '../../.eslintrc.js',
  globals: {
    // React Native globals
    Response: true,
    RequestInit: true,
    fetch: true,
    Blob: true,
  },
  rules: {
    'unicorn/prefer-number-properties': 'off',
  },
}
