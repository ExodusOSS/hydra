import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    files: ['package.json'],
    rules: {
      '@exodus/package/permissive-dependencies': 'off',
    },
  },
]

export default config.flat()
