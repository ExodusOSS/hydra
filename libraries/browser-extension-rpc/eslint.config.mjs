import rootConfig from '../../eslint.config.mjs'

const config = [
  rootConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
        Image: 'readonly',
      },
    },
  },
].flat()

export default config
