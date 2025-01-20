import buildMetadata from '../constants/build-metadata'

const config = {
  addressProvider: {
    addressCacheFlavor: 'memory',
  },
  availableAssets: {
    defaultAvailableAssetNames: ['ethereum'],
  },
  enabledAssets: {
    defaultEnabledAssetsList: ['ethereum', 'tetherusd'],
    defaultEnabledAssetsListForFreshWallets: ['ethereum', 'tetherusd'],
  },
  geolocationMonitor: {
    apiUrl: 'https://exchange.exodus.io/v3/geolocation',
    appName: 'sdk-minimal-demo',
    appVersion: buildMetadata.version,
  },
  keychain: {
    cachePublicKeys: false,
  },
  remoteConfig: {
    remoteConfigUrl: `https://remote-config.exodus.io/v1/browser.json`,
  },
}

export default config
