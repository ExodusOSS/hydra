import type { LogParams } from './transport.js'
import type Transport from './transport.js'
import debug from 'debug'

export default class DebugTransport implements Transport {
  log({ args, level, namespace = '' }: LogParams) {
    debug(namespace).extend(level)(...args)
  }
}
