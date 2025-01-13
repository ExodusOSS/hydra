import assert from 'minimalistic-assert'
import { WalletAccount } from '@exodus/models'
import Emitter from '@exodus/wild-emitter'
import { randomBytes } from '@exodus/crypto/randomBytes'
import delay from 'delay'
import { NoDeviceFoundError, UserRefusedError } from '@exodus/hw-common'

import type {
  HardwareSignerProvider,
  GetXPUBParams,
  CanAccessAssetParams,
  CreateParams,
  StoreSyncedKeysParams,
  ScanParams,
  SyncParams,
  GetFirstNAddressesParams,
  GetFirstNAddressesResult,
  EnsureApplicationIsOpenedParams,
  SignTransactionParams,
  FetchBalanceResult,
  FetchBalanceParams,
  ScanResult,
  ScannedAccount,
  SyncedKeysId,
  GetXPUBResult,
  GetPublicKeyParams,
  GetPublicKeyResult,
  GetAddressParams,
  GenericSignCallback,
  GenericSignParams,
  SyncedKeysData,
  KeyToSyncData,
  RequireDeviceForParams,
} from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'
import type {
  HardwareWalletDevice,
  HardwareWalletDiscovery,
  SignMessageParams,
} from '@exodus/hw-common'
import type { Atom } from '@exodus/atoms'
import type { IPublicKeyStore } from '@exodus/public-key-provider/lib/module/store/types'
import type { Logger } from '@exodus/logger'

export type Dependencies = {
  assetsModule: any
  ledgerDiscovery: HardwareWalletDiscovery
  logger: Logger
  userInterface: any
  publicKeyStore: IPublicKeyStore
  wallet: any
  walletAccountsAtom: Atom<WalletAccount>
  walletAccounts: any
  txLogMonitors: any
  restoreProgressTracker: any
}

export class HardwareWallets implements HardwareSignerProvider {
  readonly #assetsModule: any
  readonly #ledgerDiscovery: HardwareWalletDiscovery
  readonly #logger: Logger
  readonly #userInterface: any
  readonly #publicKeyStore: any
  readonly #wallet: any
  readonly #walletAccountsAtom: Atom<WalletAccount>
  readonly #walletAccounts: any
  // readonly #txLogMonitors: any
  // readonly #restoreProgressTracker: any

  /* A temporary in-memory map that contains the public keys and xpubs to sync during onboarding */
  #syncedKeysMap = new Map<SyncedKeysId, SyncedKeysData>()

  readonly events = new Emitter()

  constructor({
    assetsModule,
    ledgerDiscovery,
    logger,
    userInterface,
    publicKeyStore,
    wallet,
    walletAccountsAtom,
    walletAccounts,
    // txLogMonitors,
    // restoreProgressTracker,
  }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#ledgerDiscovery = ledgerDiscovery
    this.#logger = logger
    this.#userInterface = userInterface
    this.#publicKeyStore = publicKeyStore
    this.#wallet = wallet
    this.#walletAccountsAtom = walletAccountsAtom
    this.#walletAccounts = walletAccounts
    // this.#txLogMonitors = txLogMonitors
    // this.#restoreProgressTracker = restoreProgressTracker
  }

  #getSelectedDevice = async (): Promise<{
    device: HardwareWalletDevice
  }> => {
    const descriptors = await this.#ledgerDiscovery.list()

    if (descriptors[0]) {
      return { device: await descriptors[0].get() }
    }

    throw new NoDeviceFoundError()
  }

  #requestUserAction = async (params: unknown) => {
    const rpc = this.#userInterface.getRPC()
    return rpc.callMethod('handle-hardware-wallet', params)
  }

  #signGeneric = async ({ baseAssetName, scenario, sign }: GenericSignParams) => {
    let attempts = 0
    const MAX_ATTEMPTS = 50 // High enough that users wouldn't hit this.
    while (attempts < MAX_ATTEMPTS) {
      try {
        const approvePromise = this.#requestUserAction({
          scenario,
          baseAssetName,
        })
        const { device } = await this.#getSelectedDevice()
        const runSign = async () => {
          await device.ensureApplicationIsOpened(baseAssetName)
          return sign({ device })
        }

        const result = await Promise.race([approvePromise, runSign()])
        if (typeof result === 'object' && result.tryAgain === false) {
          device.cancelAction()
          throw new UserRefusedError(false)
        }

        this.#requestUserAction({ scenario: 'completed' })
        return result
      } catch (error: any) {
        if ((error as Error).message.includes('timeout')) {
          // The request has timed  out
          break
        } else if ((error as Error).name === 'UserRefusedError') {
          // The user has refused the action on the device
          throw error
        }

        if (
          ['DisconnectedDevice', 'DisconnectedDeviceDuringOperation'].includes(
            (error as Error).name
          )
        ) {
          // App was opened, bluetooth reset
          continue
        }

        try {
          const { tryAgain } = await this.#requestUserAction({
            error,
            baseAssetName,
          })
          if (!tryAgain) {
            this.#logger.warn(error)
            break
          }
        } catch (_error) {
          this.#logger.error(_error)
          break
        }
      } finally {
        attempts++
        await delay(200)
      }
    }

    this.#requestUserAction({ scenario: 'completed' })
    throw new UserRefusedError(false)
  }

  signTransaction = async ({
    baseAssetName,
    unsignedTx,
    walletAccount,
    multisigData,
  }: SignTransactionParams) => {
    const baseAsset = this.#assetsModule.getAsset(baseAssetName)
    const accountIndex = walletAccount.index

    const sign: GenericSignCallback = async ({ device }) => {
      return baseAsset.api.signHardware({
        unsignedTx,
        hardwareDevice: device,
        accountIndex,
        multisigData,
      })
    }

    return this.#signGeneric({ baseAssetName, scenario: 'signTransaction', sign })
  }

  signMessage = async ({ assetName, derivationPath, message }: SignMessageParams) => {
    const baseAssetName = this.#assetsModule.getAsset(assetName).baseAsset.name

    const sign: GenericSignCallback = async ({ device }) => {
      return device.signMessage({
        assetName: baseAssetName,
        derivationPath,
        message,
      })
    }

    return this.#signGeneric({ baseAssetName, scenario: 'signMessage', sign })
  }

  /**
   * Check if any device is connected.
   * @returns {Promise<boolean>} connection status
   */
  isDeviceConnected = async (): Promise<boolean> => {
    try {
      const devices = await this.#ledgerDiscovery.list()
      return devices.length > 0
    } catch {
      return false
    }
  }

  /**
   * Starts a scan for devices on the hardware wallet discovery services.
   * @returns
   */
  scanForDevices = async () => {
    // Stop any previous scan & clear all known devices.
    this.#ledgerDiscovery.stopScan(true)
    // Start a new scan
    return this.#ledgerDiscovery.scan()
  }

  /**
   * Get the available devices by model and name.
   * @returns {Promise<any>}
   */
  getAvailableDevices = async () => {
    const devices = await this.#ledgerDiscovery.list()
    return devices.map((device) => ({
      model: device.model,
      name: device.name,
    }))
  }

  /**
   * Whether the hardware wallet is in a state whether it can perform
   * asset related actions such as  getting addresses, public keys or
   * sign transactions and messages for a given assetName.
   * @param {CanAccessAssetParams} params
   * @param {string} params.assetName - the asset name to check.
   * @returns {Promise<boolean>} accessibility status.
   */
  canAccessAsset = async ({ assetName }: CanAccessAssetParams): Promise<boolean> => {
    const asset = this.#assetsModule.getAsset(assetName)

    const { device } = await this.#getSelectedDevice()
    const useableAssetNames = new Set(await device.listUseableAssetNames())
    return useableAssetNames.has(asset.baseAsset.name)
  }

  /**
   * List all the currently useable asset names for the connected device.
   * @returns {Promise<string[]>} - Useable asset names
   */
  listUseableAssetNames = async (): Promise<string[]> => {
    const { device } = await this.#getSelectedDevice()
    return device.listUseableAssetNames()
  }

  /**
   * Ensures the asset is useable or throws error.
   * @param {EnsureApplicationIsOpenedParams} params
   * @param {string} params.assetName - the asset name to check.
   */
  ensureApplicationIsOpened = async ({ assetName }: EnsureApplicationIsOpenedParams) => {
    const asset = this.#assetsModule.getAsset(assetName)

    let i = 0
    while (i < 3) {
      try {
        const { device } = await this.#getSelectedDevice()
        await device.ensureApplicationIsOpened(asset.baseAsset.name)
      } catch (error) {
        this.#logger.log(error)
      } finally {
        // Sleep for a second to give the OS a chance to recover
        // from any USB resets that may occur when switching app contexts
        await delay(1000)
        i++
      }
    }
  }

  getAddress = async ({
    assetName,
    accountIndex,
    addressIndex,
    multisigData,
    displayOnDevice,
  }: GetAddressParams) => {
    const asset = this.#assetsModule.getAsset(assetName)

    const supportedPurposes = asset.baseAsset.api.getSupportedPurposes({
      compatibilityMode: 'ledger',
      isMultisig: !!multisigData,
    })
    const { derivationPath } = asset.baseAsset.api.getKeyIdentifier({
      compatibilityMode: 'ledger',
      purpose: supportedPurposes[0], // TODO: how to deal with multiple purpose assets like bitcoin?
      accountIndex,
      chainIndex: 0,
      addressIndex,
    })

    const { device } = await this.#getSelectedDevice()
    return device.getAddress({
      assetName,
      derivationPath,
      multisigData,
      displayOnDevice,
    })
  }

  #getXPUB = async ({
    device,
    baseAsset,
    purpose,
    accountIndex,
  }: GetXPUBParams): Promise<GetXPUBResult | null> => {
    try {
      const keyIdentifier = baseAsset.api.getKeyIdentifier({
        compatibilityMode: 'ledger',
        purpose,
        accountIndex,
        // These values must be undefined to retrieve the XPUBs.
        // https://github.com/ExodusMovement/exodus-hydra/pull/8192#discussion_r1705663905
        chainIndex: undefined,
        addressIndex: undefined,
      })

      const { derivationPath } = keyIdentifier
      const xpub = await device.getXPub({
        assetName: baseAsset.name,
        derivationPath,
      })

      if (xpub) {
        return { keyIdentifier, xpub }
      }

      return null
    } catch (error: any) {
      if (
        error.name === 'XPubUnsupportedError' ||
        error.message.includes(`XPUB derivation is not allowed`)
      ) {
        this.#logger.warn(`Retrieving XPUBs for ${baseAsset.name} is not supported`, error)
        return null
      }

      throw error
    }
  }

  #getPublicKey = async ({
    device,
    baseAsset,
    purpose,
    accountIndex,
  }: GetPublicKeyParams): Promise<GetPublicKeyResult> => {
    const keyIdentifier = baseAsset.api.getKeyIdentifier({
      compatibilityMode: 'ledger',
      purpose,
      accountIndex,
    })

    const { derivationPath } = keyIdentifier
    const publicKey = await device.getPublicKey({
      assetName: baseAsset.name,
      derivationPath,
    })

    return { keyIdentifier, publicKey }
  }

  #fetchBalance = async ({ asset, address }: FetchBalanceParams): Promise<FetchBalanceResult> => {
    try {
      return await asset.api.getBalanceForAddress(address)
    } catch {
      return null
    }
  }

  /**
   * Gets n addresses starting at an offset for an account index and their corresponding balances.
   * @param {object} params
   * @param {string} params.assetName - The asset name.
   * @param {string} params.accountIndex - The account index to use.
   * @param {string} params.n - The amount of addresses to generate.
   * @param {string} params.offsetBy - The starting offset.
   * @returns {object} an objectmap where the keys are the addresses and the values are the stringified balances
   */
  #getFirstNAddresses = async ({
    assetName,
    accountIndex,
    n,
    offsetBy,
  }: GetFirstNAddressesParams): Promise<GetFirstNAddressesResult> => {
    const asset = this.#assetsModule.getAsset(assetName)
    const startIndex = offsetBy

    const addresses: string[] = []
    for (let idx = startIndex; idx < startIndex + n; idx++) {
      addresses.push(await this.getAddress({ assetName, accountIndex, addressIndex: idx }))
    }

    const fetchedBalances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        balance: await this.#fetchBalance({ asset, address }),
      }))
    )

    const addressToBalanceMap: Record<string, string | null> = Object.create(null)
    fetchedBalances.forEach(({ address, balance }) => {
      addressToBalanceMap[address] = balance
    })

    return addressToBalanceMap
  }

  /**
   * Scans addresses for a given asset name and set of accountIndexes, the amount of addresses to scan
   * is limited by addressLimit and their addressIndex starts at addressOffset.
   * @param {ScanParams} params
   * @param {string} params.assetName - the asset name to sync
   * @param {number[]} params.accountIndexes - array of account indexes to scan
   * @param {number=} params.addressLimit - limits the amount of addresses to scan (default = 2)
   * @param {number} params.addressOffset - the address offset at which to start
   * @returns {ScanResult} an array of objects containing the accountIndex, addresses and balance.
   */
  scan = async ({
    assetName,
    accountIndexes,
    addressLimit = 2,
    addressOffset = 0,
  }: ScanParams): Promise<ScanResult> => {
    let usedAccountIndexes: number[] = []
    if (await this.#wallet.exists()) {
      const walletAccounts = Object.values(await this.#walletAccountsAtom.get())
      usedAccountIndexes = walletAccounts
        .filter(({ source }) => source === WalletAccount.LEDGER_SRC)
        .map(({ index }) => index)
    }

    const accounts = accountIndexes.map((accountIndex) => ({ accountIndex }) as ScannedAccount)
    for (const account of accounts) {
      const addressToBalanceMap = await this.#getFirstNAddresses({
        assetName,
        accountIndex: account.accountIndex,
        n: addressLimit,
        offsetBy: addressOffset,
      })
      account.addressToBalanceMap = addressToBalanceMap
      account.mayAlreadyBeSynced = usedAccountIndexes.includes(account.accountIndex)
    }

    /**
     * [
     *  {
     *   accountIndex: 0,
     *   addresses: {
     *     "0x86d9A6ed1aB9b10394796E16131CFCfb7f657C5c": "0.02 ETH"
     *   },
     *   mayAlreadyBeSynced: false
     *  }
     * ]
     */
    return accounts
  }

  /**
   * Fetch the XPUBs and public keys from the hardware wallet device and return it as a result.
   * note: this will only sync the currently opened asset on Ledger.
   * @param {SyncParams} params
   * @param {number} params.accountIndex - the account index to sync
   * @returns {string} the unique identifier for the synchronized keys
   */
  sync = async ({ accountIndex: index, isMultisig }: SyncParams = {}): Promise<SyncedKeysId> => {
    const keysToSync: KeyToSyncData[] = []

    // Retrieve the public keys from the device to our wallet
    const { device } = await this.#getSelectedDevice()
    const accountIndex =
      index ?? this.#walletAccounts.getNextIndex({ source: WalletAccount.LEDGER_SRC })
    const useableAssetNames = new Set(await device.listUseableAssetNames())
    for (const assetName of useableAssetNames) {
      const asset = this.#assetsModule.getAsset(assetName)
      if (!asset) {
        this.#logger.warn(`asset with ${assetName} was not found`)
        continue
      }

      const baseAsset = asset.baseAsset
      const supportedPurposes = baseAsset.api.getSupportedPurposes({
        compatibilityMode: 'ledger',
        isMultisig,
      })
      for (const purpose of supportedPurposes) {
        const {
          keyIdentifier,
          xpub,
          publicKey,
        }: Partial<GetXPUBResult> & Partial<GetPublicKeyResult> =
          (await this.#getXPUB({ device, baseAsset, purpose, accountIndex })) ||
          (await this.#getPublicKey({ device, baseAsset, purpose, accountIndex }))

        keysToSync.push([keyIdentifier, { xpub, publicKey }] as KeyToSyncData)
      }
    }

    // Generate a random id and map it to the public keys
    // this prevents a bunch of serialization issues.
    const id = randomBytes(16).toString('hex')
    this.#syncedKeysMap.set(id, {
      accountIndex,
      model: device.descriptor.model,
      assetNames: useableAssetNames,
      keysToSync,
    })

    return id
  }

  /**
   * Synchronise the XPUBs and public keys from the hardware wallet device
   * to our wallet for a given wallet account.
   * note: this will only sync the currently opened asset on Ledger.
   * @param {StoreSyncedKeysParams} params
   * @param {string} params.walletAccountName - the wallet account name to store for
   * @param {string} params.syncedKeysId - the unique id for synced keys
   */
  addPublicKeysToWalletAccount = async ({ walletAccount, syncedKeysId }: StoreSyncedKeysParams) => {
    assert(
      this.#syncedKeysMap.has(syncedKeysId),
      `no synchronized keys found for id ${syncedKeysId}`
    )

    const { assetNames, keysToSync } = this.#syncedKeysMap.get(syncedKeysId)!

    for (const [keyIdentifier, keys] of keysToSync) {
      const { xpub, publicKey } = keys
      await this.#publicKeyStore.add({ walletAccount, keyIdentifier, xpub, publicKey })
    }

    this.events.emit('syncAssets', { assetNames })
    // for (const assetName of assetNames) {
    //   // eslint-disable-next-line @exodus/hydra/no-asset-conditions
    //   if (assetName === 'ethereum' || assetName === 'matic') {
    //     // Ethereum, matic and other EVMs may share the same address so syncing one
    //     // may also syncs the others. We do a little bit of magic here to make that happen.
    //     // TODO: generalize this logic so we don't need asset name logic
    //     this.#restoreProgressTracker.restoreAsset('ethereum')
    //     this.#restoreProgressTracker.restoreAsset('matic')
    //     this.#txLogMonitors.update({ assetName: 'ethereum', refresh: true })
    //     this.#txLogMonitors.update({ assetName: 'matic', refresh: true })
    //   } else {
    //     this.#restoreProgressTracker.restoreAsset(assetName)
    //     this.#txLogMonitors.update({ assetName, refresh: true })
    //   }
    // }
  }

  /**
   *
   * @param {CreateParams} params
   * @param {string} params.syncedKeysId - the unique id for synced keys
   */
  create = async ({ syncedKeysId, isMultisig }: CreateParams): Promise<WalletAccount> => {
    assert(
      this.#syncedKeysMap.has(syncedKeysId),
      `no synchronized keys found for id ${syncedKeysId}`
    )

    const { accountIndex, model } = this.#syncedKeysMap.get(syncedKeysId)!
    // Create a new wallet account
    const walletAccount = new WalletAccount({
      label: `Ledger${accountIndex === 0 ? '' : ' ' + accountIndex}`,
      icon: 'ledger',
      source: WalletAccount.LEDGER_SRC,
      model,
      index: accountIndex,
      // We're unable to derive a unique ID for the Ledger.
      id: randomBytes(32).toString('hex'),
      isMultisig: !!isMultisig,
    })
    const walletAccountName = walletAccount.toString()
    await this.#walletAccounts.create(walletAccount)
    await this.#walletAccounts.setActive(walletAccountName)

    await this.addPublicKeysToWalletAccount({ walletAccount, syncedKeysId })

    return walletAccount
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requireDeviceFor = async ({ walletAccount }: RequireDeviceForParams) => {
    return {
      signTransaction: this.signTransaction,
      signMessage: this.signMessage,
    }
  }
}

const createHardwareWalletsModule = (opts: Dependencies) => new HardwareWallets(opts)

const hardwareWalletsModuleDefinition = {
  id: 'hardwareWallets',
  type: 'module',
  factory: createHardwareWalletsModule,
  dependencies: [
    'assetsModule',
    'logger',
    'ledgerDiscovery',
    'userInterface',
    'publicKeyStore',
    'wallet',
    'walletAccountsAtom',
    'walletAccounts',
  ],
  public: true,
} as const satisfies Definition

export default hardwareWalletsModuleDefinition
