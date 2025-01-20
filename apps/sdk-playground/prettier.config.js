import sharedConfig from '@exodus/prettier'

/** @type {import("prettier").Config} */
const config = {
  ...sharedConfig,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
