import base from '../../eslint.config.mjs'

/** @type { import('eslint').Linter.Config[] } */
const config = [
  base,
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
]

export default config.flat()
