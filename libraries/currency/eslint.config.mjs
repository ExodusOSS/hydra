import baseConfig from '../../eslint.config.mjs'

const config = [
  {
    ignores: ['**/__benchmarks__', '**/*.d.ts'],
  },
  baseConfig,
  {
    rules: {
      '@exodus/hydra/no-unsafe-number-unit-methods': 'off',
    },
  },
]

export default config.flat()
