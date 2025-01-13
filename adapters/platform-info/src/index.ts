import { AppPlatform, PlatformInfo, PlatformInfoAdapter } from './utils/types'
import { OS_FAMILY_BY_NAME } from './constants'

const createPlatformInfo = (): PlatformInfoAdapter => ({
  async get(): Promise<PlatformInfo> {
    const { os, arch } = await chrome.runtime.getPlatformInfo()

    return {
      platform: AppPlatform.Browser,
      os: {
        name: os,
        architecture: arch,
        family: OS_FAMILY_BY_NAME.get(os),
      },
    }
  },
})

export default createPlatformInfo
