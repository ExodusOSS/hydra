export type Args = [unknown, ...unknown[]]

export type LogLevel = 'trace' | 'debug' | 'log' | 'info' | 'warn' | 'error'

export type LogFn = (...args: Args) => void
export type Logger = Record<LogLevel, LogFn>
