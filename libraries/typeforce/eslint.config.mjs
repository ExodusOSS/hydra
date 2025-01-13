import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['bench/**', 'test/**'],
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
]
