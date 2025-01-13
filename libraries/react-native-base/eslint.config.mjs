import baseConfig from '../../eslint.config.mjs'

export default [
  baseConfig,
  {
    languageOptions: {
      globals: {
        FileReader: 'readonly',
        localStorage: 'readonly',
      },
    },
    settings: {
      // import/named cannot statically resolve React Native imports, see https://github.com/facebook/react-native/issues/28549
      'import/ignore': ['react-native'],
    },
    rules: {
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-empty-file': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  {
    ignores: ['patches/'],
  },
].flat()
