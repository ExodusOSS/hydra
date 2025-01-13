export enum AppPlatform {
  Mobile = 'mobile',
  Browser = 'browser',
}

export type PlatformInfo = {
  platform: AppPlatform
  os: {
    name: string
    architecture?: string
    version?: string | number
    family?: string
  }
  device?: {
    manufacturer: string
  }
}

export interface PlatformInfoAdapter {
  get(): Promise<PlatformInfo>
}
