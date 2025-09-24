import { Address, AddressSet } from '@exodus/models'
import typeforce from '@exodus/typeforce'
import { getDefaultPurpose } from '../utils/index.js'
import { getDefaultPathIndexes } from '@exodus/asset-lib'
import { createPath, resolveUnusedAddressIndexesFromAddresses } from './utils.js'
import { parseDerivationPath } from '@exodus/key-utils'
import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'
import lodash from 'lodash'
import { types } from './validation.js'
import BIP32 from '@exodus/bip32'
import BipPath from 'bip32-path'
import { UnsupportedAssetSourceError } from '../errors/index.js'

const { uniqBy } = lodash

export class AddressProvider {
  #assetsModule
  #publicKeyProvider
  #addressCache
  #knownAddresses
  #accountStatesAtom
  #assetSources
  #logger
  #multisigAtom

  constructor({
    assetsModule,
    addressCache,
    knownAddresses,
    accountStatesAtom,
    assetSources,
    publicKeyProvider,
    logger,
    multisigAtom,
  }) {
    this.#assetsModule = assetsModule
    this.#addressCache = addressCache
    this.#knownAddresses = knownAddresses
    this.#accountStatesAtom = accountStatesAtom
    this.#assetSources = assetSources
    this.#publicKeyProvider = publicKeyProvider
    this.#logger = logger
    this.#multisigAtom = multisigAtom
  }

  #getAsset = (assetName) => this.#assetsModule.getAsset(assetName)

  // Note: don't use arrow function to allow sub-classing
  async getAddress(opts) {
    typeforce(
      {
        ...types.assetSource,
        purpose: types.purpose,
        // some compatibility modes may not have chain or address index
        chainIndex: typeforce.maybe(types.chainIndex),
        addressIndex: typeforce.maybe(types.addressIndex),
        useCache: '?Boolean',
      },
      opts,
      true
    )

    const { purpose, assetName, walletAccount, chainIndex, addressIndex, useCache = true } = opts
    const walletAccountName = walletAccount.toString()
    await this.#assertAssetSourceIsSupported({ walletAccount: walletAccountName, assetName })

    if (purpose) {
      const supportedPurposes = await this.#assetSources.getSupportedPurposes({
        walletAccount: walletAccountName,
        assetName,
      })

      assert(
        supportedPurposes.includes(purpose),
        `purpose "${purpose}" is not supported for asset "${assetName}" in wallet "${walletAccount}"`
      )
    }

    const asset = this.#getAsset(assetName)

    const { baseAsset } = asset

    const keyIdArgs = baseAsset.api.getKeyIdentifier({
      purpose,
      accountIndex: walletAccount.index,
      chainIndex,
      addressIndex,
      compatibilityMode: walletAccount.compatibilityMode,
    })

    const keyIdentifier = new KeyIdentifier(keyIdArgs)
    const canUseCache = !asset.api.features?.abstractAccounts
    const cached =
      canUseCache && useCache
        ? await this.#addressCache.get({
            walletAccountName,
            baseAssetName: asset.baseAsset.name,
            derivationPath: keyIdentifier.derivationPath,
          })
        : undefined

    const { purpose: derivedPurpose } = parseDerivationPath(keyIdentifier.derivationPath)

    if (cached) {
      const path = createPath({ chainIndex, addressIndex })
      return Address.fromJSON({
        meta: { path, purpose: derivedPurpose, keyIdentifier, walletAccount: walletAccountName },
        ...cached,
      })
    }

    const args = {
      walletAccount,
      asset,
      keyIdentifier,
      purpose: derivedPurpose,
      chainIndex,
      addressIndex,
    }

    const address = await (walletAccount.isMultisig
      ? this.#getMultisigAddress(args)
      : this.#getSinglesigAddress(args))

    if (canUseCache) {
      // don't wait for this
      this.#addressCache.set({
        walletAccountName: walletAccount.toString(),
        baseAssetName: asset.baseAsset.name,
        derivationPath: keyIdentifier.derivationPath,
        address,
      })
    }

    return address
  }

  getEncodedPublicKey = async (opts) => {
    const { walletAccount, assetName, purpose, chainIndex, addressIndex } = typeforce.parse(
      {
        ...types.assetSource,
        purpose: types.purpose,
        chainIndex: types.chainIndex,
        addressIndex: typeforce.maybe(types.addressIndex),
      },
      opts
    )

    const { baseAsset } = this.#getAsset(assetName)
    const walletAccountName = walletAccount.toString()
    const keyIdentifier = baseAsset.api.getKeyIdentifier({
      purpose,
      accountIndex: walletAccount.index,
      chainIndex,
      addressIndex,
      compatibilityMode: walletAccount.compatibilityMode,
    })

    const publicKey = await this.#publicKeyProvider.getPublicKey({
      walletAccount: walletAccountName,
      keyIdentifier,
    })

    let stakingPublicKey
    if (baseAsset.api.getStakingKeyIdentifier) {
      const stakingKeyIdentifier = baseAsset.api.getStakingKeyIdentifier({
        compatibilityMode: walletAccount.compatibilityMode,
        purpose,
        accountIndex: walletAccount.index,
        addressIndex,
      })

      if (stakingKeyIdentifier) {
        stakingPublicKey = await this.#publicKeyProvider.getPublicKey({
          walletAccount: walletAccountName,
          keyIdentifier: stakingKeyIdentifier,
        })
      }
    }

    return baseAsset.keys.encodePublic(publicKey, { purpose }, stakingPublicKey)
  }

  #getSinglesigAddress = async ({
    walletAccount,
    asset,
    keyIdentifier,
    purpose,
    chainIndex,
    addressIndex,
  }) => {
    const walletAccountName = walletAccount.toString()

    if (asset.api.features?.abstractAccounts) {
      const accountName = await this.#getMainAccountName({ walletAccount, assetName: asset.name })
      return new Address(accountName, {
        path: createPath({ chainIndex, addressIndex }),
        walletAccount: walletAccountName,
        purpose,
        keyIdentifier,
      })
    }

    const encodedPublicKey = await this.getEncodedPublicKey({
      walletAccount,
      assetName: asset.name,
      purpose,
      chainIndex,
      addressIndex,
    })

    return new Address(encodedPublicKey, {
      path: createPath({ chainIndex, addressIndex }),
      walletAccount: walletAccountName,
      purpose,
      keyIdentifier,
    })
  }

  #getMultisigAddress = async ({
    walletAccount,
    asset,
    keyIdentifier,
    purpose,
    chainIndex,
    addressIndex,
  }) => {
    const walletAccountName = walletAccount.toString()
    const [publicKey, multisigData] = await Promise.all([
      this.#publicKeyProvider.getPublicKey({
        walletAccount: walletAccountName,
        keyIdentifier,
      }),
      this.#multisigAtom.get().then((s) => s[walletAccountName]),
    ])

    const path = BipPath.fromPathArray([chainIndex, addressIndex]).toString()

    const publicKeys = multisigData.cosigners.map(({ assetPublicKeys }) => {
      if (asset.api.features.multipleAddresses) {
        return BIP32.fromXPub(assetPublicKeys[asset.baseAssetName]).derive(path).publicKey
      }

      return Buffer.from(assetPublicKeys[asset.baseAssetName], 'hex')
    })

    assert(
      publicKeys.filter((k) => k.equals(publicKey)).length === 1,
      `Invalid derivation at ${chainIndex}/${addressIndex}`
    )

    const internalPubkey = BIP32.fromXPub(multisigData.internalXpub).derive(path).publicKey

    const {
      address: encodedPublicKey,
      redeem,
      witness,
    } = await asset.encodeMultisigContract(publicKeys, {
      version: multisigData.version,
      threshold: multisigData.threshold,
      internalPubkey,
    })

    return new Address(encodedPublicKey, {
      path: createPath({ chainIndex, addressIndex }),
      walletAccount: walletAccountName,
      purpose,
      keyIdentifier,
      spendingInfo: {
        redeem,
        witness,
      },
    })
  }

  getDefaultAddress = async ({ walletAccount, assetName, purpose, chainIndex, useCache }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
        chainIndex: typeforce.maybe(types.chainIndex),
        useCache: '?Boolean',
      },
      { assetName, walletAccount, purpose, chainIndex, useCache },
      true
    )

    const asset = this.#getAsset(assetName)

    const defaults = getDefaultPathIndexes({
      asset,
      walletAccount,
      compatibilityMode: walletAccount.compatibilityMode,
    })

    return this.getAddress(
      await this.#normalizeOptions({
        ...defaults,
        chainIndex: chainIndex ?? defaults.chainIndex,
        addressIndex: defaults.addressIndex,
        assetName,
        purpose,
        walletAccount,
        useCache,
        multiAddressMode: false,
      })
    )
  }

  getUnusedAddress = async ({ walletAccount, assetName, purpose, chainIndex, useCache }) => {
    typeforce(
      {
        ...types.assetSource,
        chainIndex: types.chainIndex,
        purpose: typeforce.maybe(types.purpose),
        useCache: '?Boolean',
      },
      { assetName, walletAccount, purpose, chainIndex, useCache },
      true
    )

    const options = await this.#normalizeOptions({
      walletAccount,
      assetName,
      purpose,
      chainIndex,
      useCache,
      multiAddressMode: true,
    })

    options.addressIndex = options.addressIndex ?? 0

    return this.getAddress(options)
  }

  getUnusedAddressIndexes = async ({ purpose, walletAccount, assetName, highestUnusedIndexes }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
      },
      { assetName, walletAccount, purpose },
      true
    )

    const addresses = await this.#knownAddresses.get({
      walletAccount,
      assetName,
    })

    let purposes = await this.#assetSources.getSupportedPurposes({
      walletAccount: walletAccount.toString(),
      assetName,
    })

    if (purpose) {
      assert(
        purposes.includes(purpose),
        `purpose "${purpose}" is not supported for asset "${assetName}" in wallet "${walletAccount}"`
      )
      purposes = [purpose]
    }

    return resolveUnusedAddressIndexesFromAddresses({
      addresses,
      purposes,
      highestUnusedIndexes,
    })
  }

  #assertAssetSourceIsSupported = async ({ walletAccount, assetName }) => {
    if (!(await this.#assetSources.isSupported({ walletAccount, assetName }))) {
      throw new UnsupportedAssetSourceError({ walletAccount, assetName })
    }
  }

  // @deprecated
  // use `assetSources` directly instead
  getSupportedPurposes = ({ walletAccount, assetName }) =>
    this.#assetSources.getSupportedPurposes({ walletAccount: walletAccount.toString(), assetName })

  // @deprecated
  // use `assetSources` directly instead
  getDefaultPurpose = ({ walletAccount, assetName }) =>
    this.#assetSources.getDefaultPurpose({ walletAccount: walletAccount.toString(), assetName })

  getReceiveAddress = async ({
    assetName,
    walletAccount,
    purpose,
    useCache = false,
    multiAddressMode,
  }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
        multiAddressMode: '?Boolean',
        useCache: '?Boolean',
      },
      { assetName, walletAccount, purpose, useCache, multiAddressMode },
      true
    )

    const opts = {
      assetName,
      walletAccount,
      purpose,
      useCache,
      chainIndex: 0,
    }

    return multiAddressMode ? this.getUnusedAddress(opts) : this.getDefaultAddress(opts)
  }

  #normalizeOptions = async ({
    walletAccount,
    assetName,
    purpose,
    addressIndex: initialAddressIndex,
    chainIndex,
    multiAddressMode,
    ...rest
  }) => {
    const asset = this.#getAsset(assetName)

    const defaultPurpose = getDefaultPurpose({
      asset,
      walletAccount,
    })

    purpose = purpose ?? defaultPurpose

    const normalized = {
      ...rest,
      purpose,
      chainIndex,
      walletAccount,
      assetName,
    }

    if (!multiAddressMode || !asset.baseAsset.api.features.multipleAddresses) {
      normalized.addressIndex = initialAddressIndex
      return normalized
    }

    const indexes = await this.getUnusedAddressIndexes({ walletAccount, assetName })
    const indexForPurpose = indexes.find((it) => it.purpose === purpose)
    assert(indexForPurpose !== undefined, 'unable to find index for purpose')

    const { chain } = indexForPurpose

    const addressIndex = walletAccount.isHardware
      ? (chain[chainIndex] ?? initialAddressIndex)
      : (initialAddressIndex ?? chain[chainIndex])

    if (walletAccount.isHardware && addressIndex !== initialAddressIndex) {
      this.#logger.warn(
        `Supplied address index ${initialAddressIndex} for a multi address asset was overridden with highest unused address index for chain ${chainIndex}: ${addressIndex}`
      )
    }

    normalized.addressIndex = addressIndex
    return normalized
  }

  getChangeAddress = async ({ assetName, walletAccount, purpose, useCache, multiAddressMode }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
        useCache: '?Boolean',
        multiAddressMode: '?Boolean',
      },
      { assetName, walletAccount, purpose, useCache, multiAddressMode },
      true
    )

    const opts = {
      assetName,
      walletAccount,
      purpose,
      useCache,
      chainIndex: 1,
    }

    return multiAddressMode ? this.getUnusedAddress(opts) : this.getDefaultAddress(opts)
  }

  getReceiveAddresses = async ({
    assetName,
    walletAccount,
    multiAddressMode,
    purpose,
    useCache = false,
  }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
        useCache: '?Boolean',
        multiAddressMode: '?Boolean',
      },
      { assetName, walletAccount, multiAddressMode, purpose, useCache },
      true
    )

    return this.#getAddresses({
      walletAccount,
      assetName,
      purpose,
      multiAddressMode,
      useCache,
      chainIndex: 0,
    })
  }

  getChangeAddresses = async ({
    assetName,
    walletAccount,
    purpose,
    multiAddressMode,
    useCache,
  }) => {
    typeforce(
      {
        ...types.assetSource,
        purpose: typeforce.maybe(types.purpose),
        multiAddressMode: '?Boolean',
        useCache: '?Boolean',
      },
      { assetName, walletAccount, multiAddressMode, purpose },
      true
    )

    return this.#getAddresses({
      walletAccount,
      assetName,
      purpose,
      multiAddressMode,
      useCache,
      chainIndex: 1,
    })
  }

  #getAddresses = async ({
    walletAccount,
    assetName,
    purpose,
    chainIndex,
    multiAddressMode,
    useCache,
  }) => {
    if (!multiAddressMode) {
      const address = await this.getDefaultAddress({
        assetName,
        walletAccount,
        purpose,
        chainIndex,
        useCache,
      })

      return AddressSet.fromArray([address])
    }

    const { baseAsset } = this.#getAsset(assetName)

    const addresses = await this.#knownAddresses
      .get({
        walletAccount,
        assetName: baseAsset.name,
      })
      .then((them) => {
        const predicate = purpose
          ? (address) => address.chainIndex === chainIndex && address.purpose === purpose
          : (address) => address.chainIndex === chainIndex
        return them.filter(predicate)
      })

    const unusedAddressIndexes = await this.getUnusedAddressIndexes({
      walletAccount,
      assetName,
      purpose,
    })

    const unusedAddresses = await Promise.all(
      unusedAddressIndexes.map(({ purpose, chain }) =>
        this.getAddress({
          walletAccount,
          assetName: baseAsset.name,
          purpose,
          chainIndex,
          addressIndex: chain[chainIndex] ?? 0,
          useCache,
        })
      )
    )

    const uniqueAddresses = uniqBy(
      [...addresses.map(({ address }) => address), ...unusedAddresses],
      (address) => address.toString()
    )

    return AddressSet.fromArray(uniqueAddresses)
  }

  #getMainAccountName = async ({ walletAccount, assetName }) => {
    const { value: accountStates } = await this.#accountStatesAtom.get()
    return (
      accountStates[walletAccount]?.[assetName]?.mainAccountName ||
      this.#getAsset(assetName).noAccountYet
    )
  }

  async isOwnAddress({ address, chainIndex = 0, walletAccount, assetName, ...opts }) {
    typeforce(
      {
        ...types.assetSource,
        chainIndex: types.chainIndex,
        address: types.nonEmptyString,
        purpose: typeforce.maybe(types.purpose),
        multiAddressMode: '?Boolean',
        useCache: '?Boolean',
      },
      { walletAccount, assetName, address, chainIndex, ...opts },
      true
    )

    const asset = this.#getAsset(assetName)

    if (asset.api.features.abstractAccounts) {
      const mainAccountName = await this.#getMainAccountName({ walletAccount, assetName })
      return address === mainAccountName
    }

    const addresses = await this.#getAddresses({ chainIndex, walletAccount, assetName, ...opts })
    return addresses.has(address)
  }
}

const createAddressProvider = (deps) => new AddressProvider(deps)

const addressProviderDefinition = {
  id: 'addressProvider',
  type: 'module',
  factory: createAddressProvider,
  dependencies: [
    'assetsModule',
    'publicKeyProvider',
    'addressCache',
    'knownAddresses',
    'accountStatesAtom',
    'assetSources',
    'logger',
    'multisigAtom?',
  ],
  public: true,
}

export default addressProviderDefinition
