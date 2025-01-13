import base from '../../eslint.config.mjs'

export default [
  base,
  {
    rules: {
      'jsdoc/check-tag-names': 'off',
      'jsdoc/check-param-names': 'off',
    },
  },
].flat()
