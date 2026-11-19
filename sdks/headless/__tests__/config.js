import { WalletAccount } from '@exodus/models'

import createLogger from './adapters/create-logger.js'

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/export-default-named
export default {
  abTesting: {
    apiUrl: 'https://schrodinger-d.a.exodus-int.com/api',
  },
  apyRatesMonitor: {
    stakingAssetNames: ['algorand', 'cardano', 'solana'],
  },
  autoEnableAssetsPlugin: {
    throttleInterval: 500,
  },
  remoteConfig: {
    fetchInterval: 2000,
    remoteConfigUrl: 'https://remote-config.exodus.io/v1/genesis.json',
  },
  walletAccounts: {
    allowedSources: [WalletAccount.EXODUS_SRC, WalletAccount.TREZOR_SRC, WalletAccount.FTX_SRC],
  },
  wallet: {
    compatibilityModes: ['metamask', 'phantom'],
  },
  keychain: {
    cachePublicKeys: false,
  },
  enabledAssets: {
    defaultEnabledAssetsList: ['bitcoin', 'ethereum'],
  },
  availableAssets: {
    defaultAvailableAssetNames: ['bitcoin', 'ethereum'],
  },
  pricingServerUrlAtom: {
    pricingServerPath: 'infrastructure.price-server.server',
    defaultPricingServerUrl: 'https://pricing-s.a.exodus-int.com',
  },
  currencyAtom: {
    defaultValue: 'USD',
  },
  languageAtom: {
    defaultValue: 'en',
  },
  marketHistoryClearCacheAtom: {
    defaultValue: null,
  },
  remoteConfigClearMarketHistoryCacheAtom: {
    path: 'infrastructure.marketHistory.clearVersion',
    defaultValue: null,
  },
  marketHistoryRefreshIntervalAtom: {
    path: 'infrastructure.marketHistory.refreshInterval',
    defaultValue: null,
  },
  kyc: {
    environment: 'sandbox',
    apiUrl: 'https://kyc-d.a.exodus.io',
  },
  addressProvider: {
    addressCacheFlavor: 'synced',
  },
  addressCache: { noSync: true },
  ioc: {
    readOnlyAtoms: {
      warn: false,
    },
    devModeAtoms: {
      logger: createLogger('exodus:dev-mode-atoms'),
      // in tests, let's let it throw so we detect issues early
      swallowObserverErrors: false,
      warnOnSameValueSet: true,
      timeoutObservers: {
        timeout: 1000,
      },
    },
  },
  assets: {
    disabledPurposes: {
      madeupcoin: [86],
    },
    multiAddressMode: {
      bitcoin: true,
    },
  },
  analytics: {
    segmentConfig: {
      apiKey: '<dummy api key>',
    },
    flushTimeout: 0,
  },
  fiatRamp: {
    assets: {
      USD: {
        name: 'USD',
        providers: {
          moonpay: { isBuySupported: true, isSellSupported: true },
        },
      },
    },
    countries: {
      US: {
        code: 'US',
        name: 'United States',
        providers: {
          moonpay: { isBuySupported: true, isSellSupported: true },
        },
      },
    },
  },
  reporting: {
    exportTimeout: 10_000,
  },
}
