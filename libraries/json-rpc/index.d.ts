export type Fn = (...args: any[]) => any
export type Listener = (data: unknown) => void
type RawResponse<T> = { error?: any; result: T }
type Methods = Map<string, Fn> | { [key: string]: Fn }
type Event = 'data' // we only support 'data' in our RPCs, no arbitrary strings

export interface Transport {
  removeListener(event: Event, listener: Listener): void
  write(data: string): void
  on(event: Event, listener: Listener): void
}

type ConstructorParams = {
  transport: Transport
  requestTimeout?: number
  generateId?: () => () => string | number
  methods?: Map<string, Fn>
  parse?: (data: string) => any
  stringify?: (data: any) => string
  getIsDevelopmentMode?: () => boolean
}

declare class RPC {
  _methods: Map<string, Fn>
  constructor(params: ConstructorParams)

  exposeMethods(methods: Methods): Map<string, Fn>
  exposeFunction(name: string, fn: Fn): void

  callMethod<T>(name: string, args: unknown[]): Promise<T>
  callMethodWithRawResponse<T>(name: string, args: unknown[]): Promise<RawResponse<T>>
  notify(name: string, args: unknown[])

  on(eventName: Event, listener: Listener)
  once(eventName: Event, listener: Listener)
  end()
}

export default RPC
