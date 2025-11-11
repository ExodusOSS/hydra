/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import _createDebug from 'debug'

const DEFAULT_LOG_LEVEL = 'log'

// eslint-disable-next-line @exodus/basic-utils/prefer-basic-utils
const createDebug = lodash.memoize(_createDebug)

// adapted from '@exodus/logger';
const createLogger = (namespace: string) => {
  const log = ({ level = DEFAULT_LOG_LEVEL, args }: { level?: string; args: any[] }) => {
    const prefix = level === DEFAULT_LOG_LEVEL ? namespace : `${namespace}:${level}`
    const debug = createDebug(prefix)
    debug(...(args as [any, ...any[]]))
  }

  return {
    __proto__: null,
    trace: (...args: any[]) => log({ level: 'trace', args }),
    debug: (...args: any[]) => log({ level: 'debug', args }),
    log: (...args: any[]) => log({ args }),
    info: (...args: any[]) => log({ level: 'info', args }),
    warn: (...args: any[]) => log({ level: 'warn', args }),
    error: (...args: any[]) => log({ level: 'error', args }),
  }
}

export default createLogger
