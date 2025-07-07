import baseConfig from '../../eslint.config.mjs'

export default [
  baseConfig,
  {
    files: ['package.json'],
    rules: {
      '@exodus/package/package-name': 'off',
    },
  },
].flat()
