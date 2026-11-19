// The config lives in schemasafe.config.cjs, so that CommonJS consumers can require() it
import schemasafeConfig from './schemasafe.config.cjs'

export const { extraFormats, formats, mode, schemas } = schemasafeConfig

export default schemasafeConfig
