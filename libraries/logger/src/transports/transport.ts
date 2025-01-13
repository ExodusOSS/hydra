import type { LogLevel } from '../types.js'

export type LogParams = {
  level: LogLevel
  args: [unknown, ...unknown[]]
  namespace?: string
}

export default interface Transport {
  log(params: LogParams): void
}
