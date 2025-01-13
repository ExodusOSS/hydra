import { pickBy, filterAsync } from '@exodus/basic-utils'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { isEmpty } = lodash

class AssetClientInterface {
  #availableAssetNamesAtom
  #walletAccountsAtom
  #enabledWalletAccountsAtom
  #transactionSigner
  #publicKeyProvider
  #config
  #createLogger

  constructor({
    blockchainMetadata,
    createLogger,
    walletAccountsAtom,
    enabledWalletAccountsAtom,
    assetsModule,
    availableAssetNamesAtom,
    addressProvider,
    feeMonitors,
    transactionSigner,
    publicKeyProvider,
    config,
  }) {
    this.blockchainMetadata = blockchainMetadata
    this.#walletAccountsAtom = walletAccountsAtom
    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.assetsModule = assetsModule
    this.addressProvider = addressProvider
    this.feeMonitors = feeMonitors
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#transactionSigner = transactionSigner
    this.#publicKeyProvider = publicKeyProvider
    this.#config = config
    this.#createLogger = createLogger

    // TODO: remove conditional when clients updated
    if (assetsModule.initialize) {
      assetsModule.initialize({ assetClientInterface: this })
    }
  }

  createLogger(namespace) {
    return this.#createLogger(namespace)
  }

  // txHistory interface

  getTxHistory = async ({ assetName, walletAccount }) => {
    return this.blockchainMetadata.getTxLog({ assetName, walletAccount })
  }

  async getTxLog({ assetName, walletAccount }) {
    return this.blockchainMetadata.getTxLog({ assetName, walletAccount })
  }

  async updateTxLogAndNotify(params) {
    return this.updateTxLogAndNotifyBatch(params).commit()
  }

  updateTxLogAndNotifyBatch = ({
    assetName,
    walletAccount,
    txs,
    refresh = false,
    batch = this.blockchainMetadata.batch(),
  }) => {
    return refresh
      ? batch.overwriteTxs({ assetName, walletAccount, txs })
      : batch.updateTxs({ assetName, walletAccount, txs })
  }

  removeTxLog = async (params) => {
    return this.removeTxLogBatch(params).commit()
  }

  removeTxLogBatch = ({
    assetName,
    walletAccount,
    txs,
    batch = this.blockchainMetadata.batch(),
  }) => {
    return batch.removeTxs({ assetName, walletAccount, txs })
  }

  // accountState interface

  async getAccountState({ assetName, walletAccount }) {
    return this.blockchainMetadata.getAccountState({ assetName, walletAccount })
  }

  async updateAccountState({ assetName, walletAccount, ...params }) {
    let { accountState } = params
    if (!accountState) {
      accountState = await this.getAccountState({ assetName, walletAccount })
    }

    return this.updateAccountStateBatch({
      ...params,
      assetName,
      walletAccount,
      accountState,
    }).commit()
  }

  updateAccountStateBatch = ({
    assetName,
    walletAccount,
    newData,
    accountState,
    batch = this.blockchainMetadata.batch(),
  }) => {
    // merge mem to keep the previous accountMem behavior
    if (!isEmpty(newData?.mem) && (!accountState || accountState.mem)) {
      newData = { ...newData, mem: { ...accountState?.mem, ...newData.mem } }
    }

    if (!isEmpty(newData)) {
      return batch.updateAccountState({ assetName, walletAccount, newData })
    }

    return batch
  }

  // walletAccounts interface

  async getWalletAccounts({ assetName }) {
    // In the future, the list of wallets may be different based on the provided assets
    const asset = this.assetsModule.getAsset(assetName)
    assert(asset, `${assetName} is not supported`)
    const enabledWalletAccounts = await this.#enabledWalletAccountsAtom.get()
    return filterAsync(Object.keys(enabledWalletAccounts), async (walletAccount) => {
      try {
        // hardware wallet account may not support coin, to check this get address
        await this.getReceiveAddress({ assetName, walletAccount, useCache: true })
        return true
      } catch {
        return false
      }
    })
  }

  // assets interface

  async getAssetsForNetwork({ baseAssetName }) {
    const availableAssetNames = new Set(await this.#availableAssetNamesAtom.get())
    return pickBy(
      this.assetsModule.getAssets(),
      (asset) => asset.baseAsset.name === baseAssetName && availableAssetNames.has(asset.name)
    )
  }

  // configParams interface

  async getAssetConfig({ assetName, walletAccount }) {
    const walletAccountInstance = await this.#getWalletAccount(walletAccount)
    const asset = this.assetsModule.getAsset(assetName)
    assert(asset, `assetName ${assetName} is not supported`)
    assert(walletAccountInstance, `walletAccountInstance ${walletAccount} is not available`)

    const baseAsset = asset.baseAsset
    const out = {
      confirmationsNumber: baseAsset.api?.getConfirmationsNumber
        ? baseAsset.api.getConfirmationsNumber()
        : 1,
    }

    const gapLimit =
      this.#config?.compatibilityModeGapLimits?.[walletAccountInstance.compatibilityMode]
    if (typeof gapLimit === 'number') {
      out.gapLimit = gapLimit
    }

    const multiAddressMode =
      this.#config?.compatibilityModeMultiAddressMode?.[walletAccountInstance.compatibilityMode]
    if (typeof multiAddressMode === 'boolean') {
      out.multiAddressMode = multiAddressMode
    }

    return out
  }

  async getConfirmationsNumber({ assetName }) {
    const baseAsset = this.assetsModule.getAsset(assetName).baseAsset
    return baseAsset.api?.getConfirmationsNumber ? baseAsset.api.getConfirmationsNumber() : 1
  }

  async updateFeeConfig({ assetName, feeConfig }) {
    await this.feeMonitors.updateFee({ assetName, feeData: feeConfig })
  }

  async getFeeData({ assetName }) {
    const baseAssetName = this.assetsModule.getAsset(assetName).baseAsset.name
    return this.feeMonitors.getFeeData({ assetName: baseAssetName })
  }

  getFeeConfig = async ({ assetName }) => {
    return this.feeMonitors.getFeeData({ assetName })
  }

  // batch interface

  // The interface consumer does not need to know the structure of the returned batch object, just
  // that it needs to be passed along wherever operations need to be batched.
  createOperationsBatch = () => this.blockchainMetadata.batch()

  executeOperationsBatch = async (batch) => batch.commit()

  // addresses interface

  getPublicKey = async ({
    assetName,
    walletAccount,
    purpose,
    addressIndex = 0,
    chainIndex = 0,
  }) => {
    if (purpose === undefined) {
      ;[purpose] = await this.getSupportedPurposes({ assetName, walletAccount })
    }

    const asset = this.assetsModule.getAsset(assetName)
    const walletAccountInstance = await this.#getWalletAccount(walletAccount)
    const keyIdentifier = asset.baseAsset.api.getKeyIdentifier({
      purpose,
      accountIndex: walletAccountInstance.index,
      chainIndex,
      addressIndex,
      compatibilityMode: walletAccountInstance.compatibilityMode,
    })

    return this.#publicKeyProvider.getPublicKey({
      walletAccount,
      keyIdentifier,
    })
  }

  getExtendedPublicKey = async ({ assetName, walletAccount, purpose }) => {
    const asset = this.assetsModule.getAsset(assetName)
    const [walletAccountInstance, purposes] = await Promise.all([
      this.#getWalletAccount(walletAccount),
      purpose === undefined
        ? await this.getSupportedPurposes({ assetName, walletAccount })
        : undefined,
    ])

    if (purpose === undefined) {
      ;[purpose] = purposes
    }

    const keyIdentifier = asset.baseAsset.api.getKeyIdentifier({
      purpose,
      accountIndex: walletAccountInstance.index,
      compatibilityMode: walletAccountInstance.compatibilityMode,
    })

    return this.#publicKeyProvider.getExtendedPublicKey({
      walletAccount,
      keyIdentifier,
    })
  }

  getAddress = async (opts) => {
    return this.addressProvider.getAddress({
      ...opts,
      walletAccount: await this.#getWalletAccount(opts.walletAccount),
    })
  }

  getReceiveAddress = async (opts) => {
    const address = await this.getReceiveAddressObject(opts)
    return address.toString()
  }

  getReceiveAddressObject = async (opts) => {
    return this.addressProvider.getReceiveAddress({
      ...opts,
      walletAccount: await this.#getWalletAccount(opts.walletAccount),
    })
  }

  getReceiveAddresses = async (opts) => {
    const addresses = await this.addressProvider.getReceiveAddresses({
      ...opts,
      walletAccount: await this.#getWalletAccount(opts.walletAccount),
    })

    return [...addresses].map((address) => address.toString())
  }

  getChangeAddresses = async (opts) => {
    const addresses = await this.addressProvider.getChangeAddresses({
      ...opts,
      walletAccount: await this.#getWalletAccount(opts.walletAccount),
    })

    return [...addresses].map((address) => address.toString())
  }

  #getWalletAccount = async (name) => {
    const walletAccounts = await this.#walletAccountsAtom.get()
    return walletAccounts[name]
  }

  getSupportedPurposes = async ({ assetName, walletAccount }) => {
    return this.addressProvider.getSupportedPurposes({
      assetName,
      walletAccount: await this.#getWalletAccount(walletAccount),
    })
  }

  getUnusedAddressIndexes = async ({ assetName, walletAccount, highestUnusedIndexes }) => {
    return this.addressProvider.getUnusedAddressIndexes({
      assetName,
      walletAccount: await this.#getWalletAccount(walletAccount),
      highestUnusedIndexes,
    })
  }

  saveUnusedAddressIndexes = async () => {
    // no op!! getUnusedAddressIndexes loads from tx log, not from storage
  }

  getNextChangeAddress = async ({ assetName, walletAccount }) => {
    return this.addressProvider.getUnusedAddress({
      assetName,
      walletAccount: await this.#getWalletAccount(walletAccount),
      chainIndex: 1,
    })
  }

  // wallet interface

  signTransaction = async ({ assetName, unsignedTx, walletAccount: walletAccountName }) => {
    const baseAssetName = this.assetsModule.getAsset(assetName).baseAsset.name
    const walletAccount = await this.#getWalletAccount(walletAccountName)
    return this.#transactionSigner.signTransaction({ baseAssetName, unsignedTx, walletAccount })
  }
}

const createAssetClientInterface = (args) => new AssetClientInterface(args)

export default createAssetClientInterface
