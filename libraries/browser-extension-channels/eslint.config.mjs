import rootConfig from '../../eslint.config.mjs'

const config = [
  rootConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
      },
    },
  },
].flat()

export default config
