import ms from 'ms'
import buildMetadata from '../build-metadata.js'
import {
  defaultEnabledAssetsList,
  defaultEnabledAssetsListForFreshWallets,
} from './constants/assets.js'
import type { Config as ExchangeConfig } from '@exodus/exchange'

const appName = 'sdk-playground'

type Config = { exchange: ExchangeConfig } & Record<string, unknown>

const config: Config = {
  availableAssets: {
    defaultAvailableAssetNames: ['bitcoin', 'ethereum', 'solana', '_usdcoin', '_tetherusd'],
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
        baseUrl: 'https://exchange.exodus.io/v3',
      },
      orders: {
        appName,
        appVersion: '1.0.0',
        baseUrl: 'https://exchange.exodus.io/v3',
      },
    },
    providers: {
      direct: {
        appName,
        appVersion: '1.0.0',
        baseUrl: 'https://exchange.exodus.io/v3',
        enabled: true,
        options: {
          extraFeatures: ['pid'],
          bypassProvidersValidation: true,
        },
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
