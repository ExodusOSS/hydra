// eslint-disable-next-line import/no-extraneous-dependencies
import { javascriptReactBabelPreset } from '@exodus/eslint-config-exodus'
import baseConfig from '../../eslint.config.mjs'

const config = [
  javascriptReactBabelPreset,
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
