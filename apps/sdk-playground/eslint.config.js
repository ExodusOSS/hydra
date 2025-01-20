import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    rules: {
      '@exodus/package/workspace-dependencies': 'off',
      '@exodus/package/permissive-dependencies': 'off',
      '@exodus/require-extensions/require-extensions': 'off',
    },
  },
]

export default config.flat()
