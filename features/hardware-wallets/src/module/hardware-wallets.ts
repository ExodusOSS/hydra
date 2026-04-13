import assert from 'minimalistic-assert'
import { WalletAccount } from '@exodus/models'
import Emitter from '@exodus/wild-emitter'
import { randomBytes } from '@exodus/crypto/randomBytes'
import delay from 'delay'
import {
  DeviceUninitializedError,
  NoDeviceFoundError,
  HardwareWalletManufacturerMismatchError,
  UserRefusedError,
} from '@exodus/hw-common'
import restrictConcurrency from 'make-concurrent'

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
  SignMessageParams,
  SyncedKeysData,
  KeyToSyncData,
  ProcessPairingCodeParams,
  SigningRequest,
  SigningRequestState,
  SetPassphraseModeParams,
} from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'
import type {
  HardwareWalletDescriptor,
  HardwareWalletDevice,
  HardwareWalletDiscovery,
  HardwareWalletManufacturer,
} from '@exodus/hw-common'
import type { Atom } from '@exodus/atoms'
import type { IPublicKeyStore } from '@exodus/public-key-provider/lib/module/store/types'
import type { Logger } from '@exodus/logger'
import pDefer from 'p-defer'

export type Dependencies = {
  assetsModule: any
  ledgerDiscovery: HardwareWalletDiscovery
  trezorDiscovery: HardwareWalletDiscovery & {
    connected: boolean
    submitPairingCode: (code: string) => Promise<any>
    clearPairingPrompt: () => Promise<void>
  }
  logger: Logger
  hardwareWalletSigningRequestsAtom: Atom<SigningRequestState>
  publicKeyStore: IPublicKeyStore
  wallet: any
  walletAccountsAtom: Atom<WalletAccount>
  walletAccounts: any
  txLogMonitors: any
  restoreProgressTracker: any
  enabledAssets: any
  availableAssetNamesAtom: Atom<string[]>
}

export class HardwareWallets implements HardwareSignerProvider {
  readonly #assetsModule: any
  readonly #ledgerDiscovery: HardwareWalletDiscovery
  readonly #trezorDiscovery: HardwareWalletDiscovery & {
    connected: boolean
    submitPairingCode: (code: string) => Promise<any>
    clearPairingPrompt: () => Promise<void>
  }

  readonly #logger: Logger
  readonly #publicKeyStore: any
  readonly #signingRequestAtom: Atom<SigningRequestState>
  readonly #wallet: any
  readonly #walletAccountsAtom: Atom<WalletAccount>
  readonly #walletAccounts: any
  readonly #enabledAssets: any
  readonly #availableAssetNamesAtom: Atom<string[]>
  // readonly #txLogMonitors: any
  // readonly #restoreProgressTracker: any

  /* A temporary in-memory map that contains the public keys and xpubs to sync during onboarding */
  #syncedKeysMap = new Map<SyncedKeysId, SyncedKeysData>()

  /** The currently active signing request */
  #signingRequest: SigningRequest | undefined

  /** Flag to prevent concurrent retry attempts */
  #isRetrying = false

  readonly events = new Emitter()

  #requireTrezorDevice = (device: HardwareWalletDevice) => {
    if (device.descriptor.manufacturer !== WalletAccount.TREZOR_SRC) {
      throw new HardwareWalletManufacturerMismatchError({
        expected: WalletAccount.TREZOR_SRC,
        actual: String(device.descriptor.manufacturer),
      })
    }

    return device as unknown as HardwareWalletDevice & {
      setPassphraseMode: (mode: 'standard' | 'hidden') => void
    }
  }

  constructor({
    assetsModule,
    ledgerDiscovery,
    trezorDiscovery,
    logger,
    hardwareWalletSigningRequestsAtom,
    publicKeyStore,
    wallet,
    walletAccountsAtom,
    walletAccounts,
    enabledAssets,
    availableAssetNamesAtom,
    // txLogMonitors,
    // restoreProgressTracker,
  }: Dependencies) {
    this.#assetsModule = assetsModule
    this.#ledgerDiscovery = ledgerDiscovery
    this.#trezorDiscovery = trezorDiscovery
    this.#logger = logger
    this.#publicKeyStore = publicKeyStore
    this.#signingRequestAtom = hardwareWalletSigningRequestsAtom
    this.#wallet = wallet
    this.#walletAccountsAtom = walletAccountsAtom
    this.#walletAccounts = walletAccounts
    this.#enabledAssets = enabledAssets
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    // this.#txLogMonitors = txLogMonitors
    // this.#restoreProgressTracker = restoreProgressTracker
  }

  #listTrezorDevicesOrEmpty = async (): Promise<HardwareWalletDescriptor[]> => {
    try {
      return await this.#trezorDiscovery.list()
    } catch (error) {
      if (error instanceof DeviceUninitializedError) {
        throw error
      }

      return []
    }
  }

  #listLedgerDevicesOrEmpty = async (): Promise<HardwareWalletDescriptor[]> => {
    try {
      return await this.#ledgerDiscovery.list()
    } catch {
      return []
    }
  }

  #getSelectedDevice = async (
    walletAccount?: WalletAccount
  ): Promise<{
    device: HardwareWalletDevice
  }> => {
    let descriptors: HardwareWalletDescriptor[]
    const manufacturer = walletAccount?.source as HardwareWalletManufacturer | undefined

    if (manufacturer === 'ledger') {
      descriptors = await this.#listLedgerDevicesOrEmpty()
    } else if (manufacturer === 'trezor') {
      descriptors = await this.#listTrezorDevicesOrEmpty()
    } else {
      const [trezors, ledgers] = await Promise.all([
        this.#listTrezorDevicesOrEmpty(),
        this.#listLedgerDevicesOrEmpty(),
      ])
      descriptors = [...trezors, ...ledgers]
    }

    if (descriptors[0]) {
      return { device: await descriptors[0].get() }
    }

    throw new NoDeviceFoundError()
  }

  #updateSigningRequest = async (state: SigningRequestState): Promise<void> => {
    // Update the internal map
    this.#logger.debug(`Updating signing request state: ${JSON.stringify(state)}`)
    await this.#signingRequestAtom.set(state)
    this.#logger.debug(`Finished updating signing request state: ${JSON.stringify(state)}`)
  }

  /**
   * Clears the signing request from the internal map and updates the UI state.
   * @param {string} id - The ID of the signing request to delete.
   */
  #deleteSigningRequest = async (id: string) => {
    if (this.#signingRequest?.id === id) {
      this.#signingRequest = undefined
      await this.#signingRequestAtom.reset()
      this.#logger.debug(`Signing request with id: ${id} has been deleted`)
    } else {
      this.#logger.warn(`No signing request found for id: ${id}`)
    }
  }

  retrySigningRequest = async (id: string) => {
    const request = this.#signingRequest
    if (request?.id !== id) {
      this.#logger.warn(`No signing request found for id: ${id}`)
      return
    }

    if (this.#isRetrying) {
      this.#logger.debug(`Retry already in progress for id: ${id}, ignoring duplicate call`)
      return
    }

    this.#isRetrying = true

    try {
      this.#logger.debug(`Attempting to get selected device for signing request with id: ${id}`)
      const { device } = await this.#getSelectedDevice(request.walletAccount)
      this.#logger.debug(`Attempting to sign for signing request with id: ${id}`)
      const result = await request.sign({ device })
      await this.#deleteSigningRequest(id)
      request.resolve(result)
    } catch (error) {
      if (this.#signingRequest?.id !== id) {
        this.#logger.warn(`Signing request with id: ${id} was cancelled, not retrying`)
        return
      }

      const _error = error as Error

      if (['DisconnectedDevice', 'DisconnectedDeviceDuringOperation'].includes(_error.name)) {
        // When an application is opened on the device, it may disconnect
        // the USB / BLE connection because the firmware hands over control
        // to the application, this involves a USB / BLE reset to flush any
        // pending messages. In this case, we wait a little bit and retry the signing request.
        this.#logger.debug(
          `Device disconnected during signing request, likely due to app opening: ${id}`,
          _error
        )
        await delay(300)

        this.#isRetrying = false
        await this.retrySigningRequest(id) // Retry the signing request
        return
      }

      // Errors for which we won't retry
      if (_error.message.includes('timeout') || _error.name === 'UserRefusedError') {
        // User refused the action on the device
        await this.cancelSigningRequest(id, false)
        return
      }

      // Allow the user to retry the signing request
      await this.#updateSigningRequest({
        id,
        scenario: 'error',
        error: _error,
        baseAssetName: this.#signingRequest.baseAssetName,
      })
    } finally {
      this.#isRetrying = false
    }
  }

  cancelSigningRequest = async (id: string, fromUI: boolean) => {
    const request = this.#signingRequest
    this.#logger.debug(`Cancelling signing request for id: ${id}, fromUI: ${fromUI}`)
    if (request?.id !== id) {
      this.#logger.warn(`No signing request found for id: ${id}`)
      return
    }

    await this.#deleteSigningRequest(id)

    // Ensure we cancel the action on the device
    if (fromUI) {
      this.#logger.debug(`Cancelling signing request on device for id: ${id}`)
      try {
        const { device } = await this.#getSelectedDevice(request.walletAccount)
        await device.cancelAction()
        this.#logger.debug(`Succesfully cancelled signing request on device for id: ${id}`)
      } catch (error: any) {
        this.#logger.error(`Failed to cancel signing request on device for id: ${id}`, error)
      }
    }

    // Now reject the promise returned to the asset caller
    request.reject(new UserRefusedError(!fromUI))
  }

  #signGeneric = restrictConcurrency(
    async ({ baseAssetName, scenario, sign, walletAccount }: GenericSignParams) => {
      const id = randomBytes(16).toString('hex')
      this.#logger.debug(
        `Starting signing request for ${baseAssetName} with scenario: ${scenario} and id: ${id}`
      )
      const deferred = pDefer()

      // Track the signing request in the internal map
      // so the UI can retry & cancel if needed.
      this.#signingRequest = {
        id,
        baseAssetName,
        walletAccount,
        sign: async ({ device }) => {
          // Kick off the signing request to the UI
          await this.#updateSigningRequest({
            id,
            baseAssetName,
            scenario,
          })

          await device.ensureDeviceReady({ baseAssetName, walletAccount })
          return sign({ device })
        },
        resolve: deferred.resolve,
        reject: deferred.reject,
      }

      // We don't await for the signing request to complete here,
      // as the UI will handle it asynchronously.
      void this.retrySigningRequest(id)

      return deferred.promise
    }
  )

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

    return this.#signGeneric({
      baseAssetName,
      scenario: 'signTransaction',
      sign,
      walletAccount,
    })
  }

  signMessage = async ({
    assetName,
    derivationPath,
    message,
    walletAccount,
  }: SignMessageParams) => {
    const baseAssetName = this.#assetsModule.getAsset(assetName).baseAsset.name

    const sign: GenericSignCallback = async ({ device }) => {
      return device.signMessage({
        assetName: baseAssetName,
        derivationPath,
        message,
      })
    }

    return this.#signGeneric({ baseAssetName, scenario: 'signMessage', sign, walletAccount })
  }

  /**
   * Check if any device is connected.
   * @returns {Promise<boolean>} connection status
   */
  isDeviceConnected = async (): Promise<boolean> => {
    try {
      const devices = await this.#trezorDiscovery.list()
      if (devices.length > 0) {
        return true
      }
    } catch (error) {
      if (error instanceof DeviceUninitializedError) {
        throw error
      }
    }

    try {
      const devices = await this.#ledgerDiscovery.list()
      return devices.length > 0
    } catch {
      return false
    }
  }

  /**
   * Starts a scan for devices on the hardware wallet discovery services.
   * @param deviceType - 'ledger' or 'trezor'
   * @returns
   */
  scanForDevices = async (deviceType?: HardwareWalletManufacturer) => {
    // Stop all scans first
    this.#trezorDiscovery.stopScan(true)
    this.#ledgerDiscovery.stopScan(true)

    if (!deviceType || deviceType === 'ledger') {
      await this.#ledgerDiscovery.scan()
    } else {
      await this.#trezorDiscovery.scan()
    }
  }

  /**
   * Get the available devices by model and name.
   * @returns {Promise<any>}
   */
  getAvailableDevices = async () => {
    const [ledgers, trezors] = await Promise.all([
      this.#listLedgerDevicesOrEmpty(),
      this.#listTrezorDevicesOrEmpty(),
    ])

    return [...ledgers, ...trezors].map((device) => ({
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

  getAddress = async ({
    assetName,
    accountIndex,
    addressIndex,
    multisigData,
    displayOnDevice,
  }: GetAddressParams) => {
    const asset = this.#assetsModule.getAsset(assetName)
    const { device } = await this.#getSelectedDevice()

    const supportedPurposes = asset.baseAsset.api.getSupportedPurposes?.({
      compatibilityMode: device.descriptor.manufacturer,
      isMultisig: !!multisigData,
    }) ?? [44]
    const { derivationPath } = asset.baseAsset.api.getKeyIdentifier({
      compatibilityMode: device.descriptor.manufacturer,
      purpose: supportedPurposes[0], // TODO: how to deal with multiple purpose assets like bitcoin?
      accountIndex,
      chainIndex: 0,
      addressIndex,
    })

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
        compatibilityMode: device.descriptor.manufacturer,
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
        error.message.includes(`XPUB derivation is not allowed`) ||
        error.message.includes('getXPub not supported')
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
      compatibilityMode: device.descriptor.manufacturer,
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
    const { device } = await this.#getSelectedDevice()
    const source = device.descriptor.manufacturer
    let usedAccountIndexes: number[] = []
    if (await this.#wallet.exists()) {
      const walletAccounts = Object.values(await this.#walletAccountsAtom.get())
      usedAccountIndexes = walletAccounts
        .filter(({ source: s }) => source === s)
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
    const source = device.descriptor.manufacturer
    const accountIndex = index ?? this.#walletAccounts.getNextIndex({ source })
    // Compute the walletId fingerprint in the currently selected session context.
    // The caller is responsible for putting the device in the desired context
    // (standard/hidden) prior to calling sync (e.g. via setPassphraseMode()).
    // Fallback to randomly generated id, since Ledger doesn't support this..
    const walletId = (await device.getWalletId?.()) ?? randomBytes(32).toString('hex')

    const useableAssetNames = new Set(await device.listUseableAssetNames())
    for (const assetName of useableAssetNames) {
      const asset = this.#assetsModule.getAsset(assetName)
      if (!asset) {
        this.#logger.warn(`asset with ${assetName} was not found`)
        continue
      }

      const baseAsset = asset.baseAsset
      const supportedPurposes = baseAsset.api.getSupportedPurposes?.({
        compatibilityMode: source,
        isMultisig,
      }) ?? [44]
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
      walletId,
    })

    return id
  }

  /**
   * Synchronise the XPUBs and public keys from the hardware wallet device
   * to our wallet for a given wallet account.
   * note: this will only sync the currently opened asset on Ledger.
   * @param {StoreSyncedKeysParams} params
   * @param {WalletAccount} params.walletAccount - the wallet account object to store for
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

    const availableAssetNames = await this.#availableAssetNamesAtom.get()
    const assetNamesToEnable = [...assetNames].filter((assetName) =>
      availableAssetNames.includes(assetName)
    )
    await this.#enabledAssets.enable(assetNamesToEnable)

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

    const { device } = await this.#getSelectedDevice()
    const source = device.descriptor.manufacturer
    const label = source === WalletAccount.LEDGER_SRC ? 'Ledger' : 'Trezor'
    const { accountIndex, model, walletId } = this.#syncedKeysMap.get(syncedKeysId)!

    // Create a new wallet account
    const walletAccount = new WalletAccount({
      label: `${label}${accountIndex === 0 ? '' : '_' + accountIndex}`,
      icon: source,
      source,
      model,
      index: accountIndex,
      id: walletId,
      isMultisig: !!isMultisig,
    })
    const walletAccountName = walletAccount.toString()
    await this.#walletAccounts.create(walletAccount)
    await this.#walletAccounts.setActive(walletAccountName)

    await this.addPublicKeysToWalletAccount({ walletAccount, syncedKeysId })

    return walletAccount
  }

  /**
   * Clear the pairing request state.
   */
  clearPairingRequest = async () => {
    await this.#trezorDiscovery.clearPairingPrompt()
  }

  /**
   * Submit a pairing code for Trezor device pairing
   * @param {ProcessPairingCodeParams} params
   * @param {string} params.code - 6-digit pairing code
   */
  submitPairingCode = async ({ code }: ProcessPairingCodeParams) => {
    return this.#trezorDiscovery.submitPairingCode(code)
  }

  setPassphraseMode = async ({ enabled }: SetPassphraseModeParams): Promise<void> => {
    const { device } = await this.#getSelectedDevice()

    const trezorDevice = this.#requireTrezorDevice(device)
    trezorDevice.setPassphraseMode(enabled ? 'hidden' : 'standard')
  }

  requireDeviceFor = async (walletAccount: WalletAccount) => {
    return {
      signTransaction: ({
        baseAssetName,
        unsignedTx,
        multisigData,
      }: Omit<SignTransactionParams, 'walletAccount'> & { walletAccount?: WalletAccount }) =>
        this.signTransaction({ baseAssetName, unsignedTx, multisigData, walletAccount }),
      signMessage: ({
        assetName,
        derivationPath,
        message,
      }: Omit<SignMessageParams, 'walletAccount'>) =>
        this.signMessage({ assetName, derivationPath, message, walletAccount }),
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
    'trezorDiscovery',
    'publicKeyStore',
    'hardwareWalletSigningRequestsAtom',
    'wallet',
    'walletAccountsAtom',
    'walletAccounts',
    'enabledAssets',
    'availableAssetNamesAtom',
  ],
  public: true,
} as const satisfies Definition

export default hardwareWalletsModuleDefinition
