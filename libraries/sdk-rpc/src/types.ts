import type JsonRPC from '@exodus/json-rpc'

export type Fn = (...args: any[]) => any
export type Listener = (data: unknown) => void

export type JsonRPCParams = ConstructorParameters<typeof JsonRPC>

export type Methods = { [key: string]: Fn | Methods }
