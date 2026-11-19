declare module '@exodus/proxy-freeze' {
  export default function proxyFreeze<T>(value: T): T
}

declare module 'events/events.js' {
  export default class EventEmitter {
    on(eventName: string | symbol, listener: (...args: unknown[]) => void): this
    once(eventName: string | symbol, listener: (...args: unknown[]) => void): this
    emit(eventName: string | symbol, ...args: unknown[]): boolean
  }
}

declare module '@exodus/bitcoin-meta' {
  export const asset: import('./types.js').Asset
}

declare module '@exodus/ethereum-meta' {
  export const asset: import('./types.js').Asset
  const assets: readonly import('./types.js').Asset[]
  export default assets
}

declare module '@exodus/monero-meta' {
  export const asset: import('./types.js').Asset
}

declare module '@exodus/bitcoin-plugin' {
  export function createAsset(options: object): import('./types.js').Asset
}

declare module '@exodus/dogecoin-plugin' {
  export function createAsset(options: object): import('./types.js').Asset
}

declare module '@exodus/assets' {
  export function connectAssetsList(
    assets: readonly import('./types.js').Asset[]
  ): Record<string, import('./types.js').Asset>
  export function connectAsset(asset: import('./types.js').Asset): import('./types.js').Asset
}

declare module '@exodus/wallet-accounts/redux/index.js' {
  import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'

  const walletAccountsReduxModule: () => ReduxModuleDefinition
  export default walletAccountsReduxModule
}

declare module '*.cjs' {
  const value: Record<string, readonly object[]>
  export default value
}
