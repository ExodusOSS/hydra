/* eslint-disable import/no-extraneous-dependencies */
import javascriptReactBabel from '@exodus/eslint-config-javascript-react-babel'
import baseConfig from '../../eslint.config.mjs'

const config = [javascriptReactBabel, baseConfig]

export default config.flat()
