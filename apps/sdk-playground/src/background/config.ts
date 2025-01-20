import ms from 'ms'
import buildMetadata from '../build-metadata.js'
import {
  defaultEnabledAssetsList,
  defaultEnabledAssetsListForFreshWallets,
} from './constants/assets.js'

const appName = 'sdk-playground'

const config = {
  availableAssets: {
    defaultAvailableAssetNames: ['bitcoin', 'ethereum'],
  },
  enabledAssets: {
    defaultEnabledAssetsList,
    defaultEnabledAssetsListForFreshWallets,
  },
  localSeedBackups: { isEnabled: true },
  localSeedBackupsAtom: { key: 'test' },
  localSeedBackupsPlugin: {},
  exchange: {
    services: {
      assets: {
        appName,
        appVersion: '1.0.0',
        baseUrl: 'https://exchange.exodus.io/v3',
      },
      orders: {
        appName,
        appVersion: '1.0.0',
        baseUrl: 'https://exchange.exodus.io/v3',
      },
    },
    providers: {
      exodus: {
        appName,
        appVersion: '1.0.0',
        baseUrl: 'https://exchange.exodus.io/v3',
        enabled: true,
        options: {
          extraFeatures: ['pid'],
          bypassProvidersValidation: true,
        },
      },
      lifi: {
        baseUrl: 'https://li.quest/v1',
        enabled: true,
        apiKeys: {
          default: '06736151-26d9-4583-a984-8b622fe7c4b7.2aebe520-6838-4940-b6a0-f29f601b59c9', // not a secret - this is a client side identifier
        },
      },
      jupiter: {
        enabled: true,
      },
    },
  },
  orders: {
    optimisticActivityEnabled: false,
    supportedSvcs: [],
    interval: ms('10s'),
    appName,
    appVersion: '1.0.0',
    baseUrl: 'https://exchange.exodus.io/v3',
    txTypes: {
      PRE_SETUP: 'preSetupTransaction',
      SETUP: 'setupTransaction',
      SWAP: 'swapTransaction',
      CLEANUP: 'cleanupTransaction',
      DEPOSIT: 'depositTransaction',
      PAYOUT: 'payoutTransaction',
    },
  },
  geolocationMonitor: {
    apiUrl: 'https://exchange.exodus.io/v3/geolocation',
    appName,
    appVersion: buildMetadata.version,
  },
  keychain: {
    cachePublicKeys: false,
  },
  pricing: {
    sandbox: true,
  },
  remoteConfig: {
    remoteConfigUrl: `https://remote-config.exodus.io/v1/eden.json`,
  },
  analytics: {
    segmentConfig: {
      apiKey: 'm7NeeAOOTEAHh9DG0xPFMR88wkdNxf8F',
    },
  },
}

export default config
