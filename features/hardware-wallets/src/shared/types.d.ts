export type Logger = Pick<Console, 'debug' | 'error' | 'info' | 'log' | 'warn'>

export type Port = {
  emit(event: string, value: unknown): void
}
