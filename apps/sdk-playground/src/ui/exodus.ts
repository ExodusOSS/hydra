/* eslint-disable import/no-extraneous-dependencies */
import debug from 'debug'
import exodus from '../background/index.js'
import createLogger from '../utils/logger.js'
import debugNamespaces from './debug-namespaces.js'
import { handleEvent } from './flux/index.js'

const logger = createLogger('exodus:events')
debug.enable(debugNamespaces)

// FIX: Make subscribe available in Exodus type
const subscribableExodus = exodus as typeof exodus & {
  subscribe: (event: any) => void
}

subscribableExodus.subscribe(({ type, payload }) => {
  logger.debug(type, payload)
  handleEvent(type, payload)
})

// eslint-disable-next-line unicorn/prefer-export-from
export default exodus
