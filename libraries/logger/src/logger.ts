import type { Args, Logger, LogLevel } from './types.js'
import type Transport from './transports/transport.js'
import ConsoleTransport from './transports/console.js'

const DEFAULT_LOG_LEVEL = 'log'

type Params = {
  transports?: Transport[]
}

export const createLoggerFactory = ({ transports = [new ConsoleTransport()] }: Params = {}) => {
  return (namespace?: string): Logger => {
    const log = ({ level = DEFAULT_LOG_LEVEL, args }: { level?: LogLevel; args: Args }) => {
      for (const transport of transports) {
        transport.log({ level, namespace, args })
      }
    }

    return {
      __proto__: null,
      trace: (...args: Args) => log({ level: 'trace', args }),
      debug: (...args: Args) => log({ level: 'debug', args }),
      log: (...args: Args) => log({ args }),
      info: (...args: Args) => log({ level: 'info', args }),
      warn: (...args: Args) => log({ level: 'warn', args }),
      error: (...args: Args) => log({ level: 'error', args }),
    } as Logger
  }
}

export default createLoggerFactory()
