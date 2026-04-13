import type { Atom } from '@exodus/atoms'

export type Fetch = typeof fetch

export type GetBuildMetadata = () => Promise<{
  appId: string
  build: string
  dev: boolean
  deviceModel: string
  osName: string
  platformName: string
  platformVersion?: string
  version: string
}>

export type RemoteConfigData = {
  config?: Record<string, any>
  lastModified?: string | null
  remoteConfigUrl?: string
}

export type RemoteConfigType = {
  load(): Promise<void>
  stop(): void
  update(): void
  get(key: string): Promise<string | undefined>
  getAll(): Promise<Record<string, any>>
  remoteConfigAtom: Atom<RemoteConfigData>
}

export type Port = {
  emit(event: string, value: any): void
}

export type Freeze = <T>(val: T) => T
