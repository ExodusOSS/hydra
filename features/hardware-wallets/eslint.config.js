import baseConfig from '../../eslint.config.mjs'

const config = [
  baseConfig,
  {
    files: ['**/*.{js,ts}'],
    settings: {
      'import/resolver': { typescript: true },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx', '.js'],
      },
    },
  },
]

export default config.flat()
