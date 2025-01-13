/* eslint-disable import/no-extraneous-dependencies */
import javascriptReactBabelConfig from '@exodus/eslint-config-javascript-react-babel'
import baseConfig from '../../eslint.config.mjs'

const config = [
  javascriptReactBabelConfig,
  baseConfig,
  {
    languageOptions: {
      globals: {
        chrome: true,
      },
    },

    rules: {
      'unicorn/prefer-logical-operator-over-ternary': 'off',
    },
  },
]

export default config.flat()
