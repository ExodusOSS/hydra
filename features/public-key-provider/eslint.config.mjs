import base from '../../eslint.config.mjs'

export default [
  base,
  {
    rules: {
      'jsdoc/check-tag-names': 'off',
    },
  },
].flat()
