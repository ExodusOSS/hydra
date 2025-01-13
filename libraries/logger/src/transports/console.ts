import type { LogParams } from './transport.js'
import type Transport from './transport.js'

type Params = {
  errorAsWarning?: boolean
}

export default class ConsoleTransport implements Transport {
  readonly #errorAsWarning: boolean

  constructor({ errorAsWarning = false }: Params = {}) {
    this.#errorAsWarning = errorAsWarning
  }

  log({ level, namespace, args }: LogParams) {
    if (namespace) {
      const prefix = level === 'log' ? `[${namespace}]` : `[${namespace}:${level}]`
      args = [prefix, ...args]
    }

    if (this.#errorAsWarning && level === 'error') {
      level = 'warn'
    }

    console[level](...args)
  }
}
