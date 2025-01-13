import { AppPlatform, PlatformInfo, PlatformInfoAdapter } from './utils/types'
import { Platform } from 'react-native'

type Dependencies = {
  deviceInfo: Promise<{ manufacturer: string }>
}

const createPlatformInfo = ({ deviceInfo }: Dependencies): PlatformInfoAdapter => ({
  async get(): Promise<PlatformInfo> {
    const manufacturer = await Platform.select({
      android: deviceInfo.then((info) => info.manufacturer),
      ios: Promise.resolve('Apple'),
    })

    return {
      platform: AppPlatform.Mobile,
      os: {
        name: Platform.OS,
        version: Platform.Version,
      },
      device: {
        manufacturer: manufacturer ?? 'unknown',
      },
    }
  },
})

export default createPlatformInfo
