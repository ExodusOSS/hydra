import ExodusModule from '@exodus/module' // eslint-disable-line import/no-deprecated

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

export type RemoteConfigType = {
  load(): Promise<void>
  stop(): void
  sync(): void
  get(key: string): Promise<string | undefined>
  getAll(): Promise<Record<string, any>>
} & ExodusModule

export type Port = {
  emit(event: string, value: any): void
}

export type Freeze = <T>(val: T) => T
