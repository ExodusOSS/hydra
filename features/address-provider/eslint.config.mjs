import baseConfig from '../../eslint.config.mjs'

const config = [
  {
    ignores: ['__tests__/package.json', 'report/__tests__/package.json'],
  },
  baseConfig,
  {
    files: ['**/__tests__/**/*.{ts,js}'],

    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
]

export default config.flat()
