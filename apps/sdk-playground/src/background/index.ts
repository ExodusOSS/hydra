import adapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

const exodus = createExodus({ adapters, config, debug: true })

export type ExodusApi = typeof exodus

export default exodus
