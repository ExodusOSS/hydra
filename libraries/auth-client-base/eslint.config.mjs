import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    files: ['example.js'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
]

export default config.flat()
