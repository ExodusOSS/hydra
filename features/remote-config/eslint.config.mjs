// eslint-disable-next-line import/no-extraneous-dependencies
import globals from 'globals'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]
