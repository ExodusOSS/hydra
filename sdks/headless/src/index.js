import addressProvider from '@exodus/address-provider'
import application from '@exodus/application'
import createIOC from '@exodus/argo'
import assetSources from '@exodus/asset-sources'
import assetsFeature from '@exodus/assets-feature'
import availableAssets from '@exodus/available-assets'
import balances from '@exodus/balances'
import blockchainMetadata from '@exodus/blockchain-metadata'
import enabledAssets from '@exodus/enabled-assets'
import errorTracking from '@exodus/error-tracking'
import featureFlags from '@exodus/feature-flags'
import fees from '@exodus/fee-data-monitors'
import filesystem from '@exodus/filesystem'
import geolocation from '@exodus/geolocation'
import keyViewer from '@exodus/key-viewer'
import keychain from '@exodus/keychain'
import locale from '@exodus/locale'
import messageSigner from '@exodus/message-signer'
import pricing from '@exodus/pricing'
import publicKeyProvider from '@exodus/public-key-provider'
import rates from '@exodus/rates-monitor'
import remoteConfig from '@exodus/remote-config'
import restoreProgressTracker from '@exodus/restore-progress-tracker'
import startupCounter from '@exodus/startup-counter'
import txLogMonitors from '@exodus/tx-log-monitors'
import transactionSigner from '@exodus/tx-signer'
import typeforce from '@exodus/typeforce'
import wallet from '@exodus/wallet'
import walletAccounts from '@exodus/wallet-accounts'
import ms from 'ms'

import createApi from './api/index.js'
import createDependencies from './dependencies/index.js'
import keychainRpc from './features/keychain-rpc/index.js'
import walletRpc from './features/wallet-rpc/index.js'
import attachMigrations from './migrations/attach.js'
import attachPlugins from './plugins/attach.js'
import { makeChainable } from './utils/ioc.js'
import cachedSodiumEncryptorRpc from './features/cached-sodium-encryptor-rpc/index.js'
import cachedSodiumEncryptor from '@exodus/cached-sodium-encryptor'

const withOverrides = ({ config, debug }) => {
  const xpubs = config.publicKeyProvider?.xpubs ?? Object.create(null)
  const isMockingXpub = config.publicKeyProvider?.debug && Object.keys(xpubs).length > 0

  return {
    ...config,
    addressProvider: {
      ...config.addressProvider,
      debug,
      // disables address cache if mocking xpubs to avoid confusion
      addressCacheFlavor: isMockingXpub ? 'disabled' : config.addressProvider?.addressCacheFlavor,
    },
  }
}

const createExodus = (opts) => {
  typeforce(
    {
      adapters: 'Object',
      config: 'Object',
      debug: '?Boolean',
    },
    opts,
    true
  )

  const { adapters, debug = false } = opts
  const config = withOverrides({ debug, config: opts.config })
  const ioc = createIOC({ adapters, config, debug })

  ioc.use(application(config.application))
  ioc.use(errorTracking(config.errorTracking))
  ioc.use(addressProvider(config.addressProvider))
  ioc.use(assetsFeature(config.assets))
  ioc.use(availableAssets(config.availableAssets))
  ioc.use(assetSources(config.assetSources))
  ioc.use(balances(config.balances))
  ioc.use(blockchainMetadata(config.blockchainMetadata))
  ioc.use(enabledAssets(config.enabledAssets))
  ioc.use(featureFlags(config.featureFlags))
  ioc.use(fees(config.fees))
  ioc.use(filesystem(config.filesystem))
  ioc.use(geolocation(config.geolocation))
  ioc.use(keyViewer(config.keyViewer))
  ioc.use(locale(config.locale))
  ioc.use(messageSigner(config.messageSigner))
  ioc.use(pricing(config.pricing))
  ioc.use(publicKeyProvider(config.publicKeyProvider))
  ioc.use(rates(config.rates))
  ioc.use(remoteConfig(config.remoteConfig))
  ioc.use(restoreProgressTracker(config.restoreProgressTracker))
  ioc.use(startupCounter(config.startupCounter))
  ioc.use(transactionSigner(config.transactionSigner))
  ioc.use(txLogMonitors(config.txLogMonitors))
  ioc.use(walletAccounts(config.walletAccounts))

  const { walletSdk } = adapters

  if (walletSdk) {
    ioc.use(keychainRpc(walletSdk.keychain))
    ioc.use(walletRpc(walletSdk.wallet))
    ioc.use(cachedSodiumEncryptorRpc(walletSdk.cachedSodiumEncryptor))
  } else {
    ioc.use(keychain(config.keychain))
    ioc.use(wallet(config.wallet))
    ioc.use(cachedSodiumEncryptor(config.cachedSodiumEncryptor))
  }

  ioc.registerMultiple(createDependencies({ adapters, config }))

  const resolve = () => {
    ioc.resolve()

    const { storage, migrateableStorage } = ioc.getByType('adapter')

    const { application, unlockEncryptedStorage } = ioc.getByType('module')

    const { migrations } = ioc.getAll()

    const port = ioc.get('port')
    application.on('start', (payload) => port.emit('start', payload))

    application.hook('load', (args) => port.emit('pre-load', args))

    application.on('load', (args) => port.emit('load', args))

    application.on('create', async (args) => port.emit('create', args))

    application.on('unlock', () => port.emit('unlock'))

    application.on('lock', () => port.emit('lock'))

    application.on('restore', () => port.emit('restore'))

    application.on('restore-completed', () => {
      port.emit('restore-completed')
    })

    application.on('change-passphrase', () => port.emit('passphrase-changed'))

    application.on('import', () => port.emit('import', { walletExists: true }))

    application.on('add-seed', () => port.emit('add-seed'))

    application.on(
      'restore-seed',
      () =>
        ({ seedId, compatibilityMode } = Object.create(null)) =>
          port.emit('restore-seed', { seedId, compatibilityMode })
    )

    application.hook('unlock', async () => {
      if (typeof storage.unlock === 'function') unlockEncryptedStorage(storage)

      // normally unlocked during migrations, also unlock here just in case
      if (typeof migrateableStorage.unlock === 'function') {
        unlockEncryptedStorage(migrateableStorage)
      }
    })

    application.on('clear', () => port.emit('clear'))

    application.on('restart', (payload) => port.emit('restart', payload))

    attachMigrations({
      migrations,
      adapters,
      application,
      atoms: ioc.getByType('atom'),
      modules: ioc.getByType('module'),
      config,
    })

    attachPlugins({
      application,
      plugins: ioc.getByType('plugin'),
      logger: ioc.get('createLogger')('attachPlugins'),
      pluginTimeout: config?.ioc?.pluginMethodsTimeout || ms('5s'),
    })

    return createApi({ ioc, port, config, debug, logger: ioc.get('createLogger')('createApi') })
  }

  return makeChainable({ ioc, methods: ['use', 'register', 'registerMultiple'], resolve })
}

export default createExodus
