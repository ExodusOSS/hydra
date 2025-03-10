import { WalletAccount, WalletAccountSet } from '@exodus/models'
import lodash from 'lodash'
import makeConcurrent from 'make-concurrent'
import assert from 'minimalistic-assert'
import pDefer from 'p-defer'
import { pDebounce, pickBy } from '@exodus/basic-utils'
import {
  containWalletAccounts,
  createEmptyAccounts,
  equalWalletAccounts,
  getChanges,
  getNextIndex,
  getUniqueTagForWalletAccount,
  shouldDeriveIndex,
} from './utils.js'
import proxyFreeze from 'proxy-freeze'
import { EXODUS_SRC } from '@exodus/models/lib/wallet-account/index.js'

const { groupBy } = lodash

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME

const walletAccountsChannel = {
  type: 'walletAccounts',
  channelName: 'walletAccounts',
  syncStateKey: 'sync:syncstate:walletAccounts',
  startFromLatest: true,
}

class WalletAccounts {
  #logger
  #walletAccountsInternalAtom
  #wallet
  #activeWalletAccountAtom
  #hardwareWalletPublicKeysAtom
  #rawFusionData = {}
  #walletAccounts = Object.create(null)
  #hardwareWalletPublicKeys = createEmptyAccounts()
  #channel
  #supportedSources
  #fillIndexGapsOnCreation
  #loaded = pDefer()

  constructor({
    logger,
    fusion,
    walletAccountsInternalAtom,
    wallet,
    activeWalletAccountAtom,
    hardwareWalletPublicKeysAtom,
    allWalletAccountsEver,
    config,
  }) {
    const { allowedSources: supportedSources, fillIndexGapsOnCreation } = config
    this.#logger = logger
    this.#walletAccountsInternalAtom = walletAccountsInternalAtom
    this.#wallet = wallet
    this.#activeWalletAccountAtom = activeWalletAccountAtom
    this.#hardwareWalletPublicKeysAtom = hardwareWalletPublicKeysAtom
    this.#fillIndexGapsOnCreation = fillIndexGapsOnCreation

    this.#supportedSources = new Set(supportedSources)

    this.#channel = fusion.channel({
      ...walletAccountsChannel,
      processOne: async ({ data }) => {
        this.#rawFusionData = data

        if (this.#pendingFusionUpdates > 0) {
          this.#pendingFusionUpdates -= 1
          return
        }

        await this.#replaceAll(data)
      },
    })

    allWalletAccountsEver?.grantChannelAccess({
      tail: async () => {
        const channel = await this.#getChannel()
        return channel.tail()
      },
    })
  }

  #pendingFusionUpdates = 0

  #getChannel = async () => {
    await this.#channel.awaitProcessed()

    return this.#channel
  }

  #updateFusion = pDebounce(async () => {
    try {
      const channel = await this.#getChannel()
      const fusionWalletAccounts = new WalletAccountSet(this.#rawFusionData?.walletAccounts || {})

      const isCustodialWallet = (name) => this.#walletAccounts[name]?.isCustodial

      const isDeletedHardwareWallet = (name) => {
        const isHardware = fusionWalletAccounts.get(name)?.isHardware
        return !this.#walletAccounts[name] && (isHardware || !name.startsWith('exodus')) // last resort hack fallback
      }

      const isKnownByPlatform = (name) => {
        return this.#supportedSources.has(fusionWalletAccounts.get([name])?.source)
      }

      // if an account is not handled by the current platform, we have to make sure that we keep
      // it and not remove it from fusion
      const accountPicker = (_, name) =>
        !isKnownByPlatform(name) || !(isDeletedHardwareWallet(name) || isCustodialWallet(name))

      const mergedHardwarePublicKeys = {
        ...this.#rawFusionData.accounts,
        ...this.#hardwareWalletPublicKeys,
      }

      await channel.push({
        type: walletAccountsChannel.type,
        data: {
          ...this.#rawFusionData,
          walletAccounts: pickBy(
            fusionWalletAccounts.update(this.#walletAccounts).toJSON(),
            accountPicker
          ),
          accounts: pickBy(mergedHardwarePublicKeys, accountPicker),
        },
      })
      this.#pendingFusionUpdates += 1
    } catch (error) {
      this.#logger.log('err', error)
    }
  }, 0)

  #persistWalletAccounts = async (walletAccounts, options = {}) => {
    if (containWalletAccounts(this.#walletAccounts, walletAccounts)) {
      return
    }

    this.#walletAccounts = { ...this.#walletAccounts, ...walletAccounts }

    await this.#save()

    if (options.useOptimisticWrite) {
      this.#updateFusion()
    } else {
      await this.#updateFusion()
    }
  }

  #save = pDebounce(async () => {
    await this.#walletAccountsInternalAtom.set(this.#walletAccounts)
  }, 0)

  #savePublicKeys = pDebounce(async () => {
    await this.#hardwareWalletPublicKeysAtom.set(this.#hardwareWalletPublicKeys)
  }, 0)

  load = async (seedParams) => {
    await this.#fixSeedParamsMismatch(seedParams)

    this.#loaded.resolve()
  }

  #fixSeedParamsMismatch = async (seedParams) => {
    const [walletAccounts, hardwareWalletPublicKeys] = await Promise.all([
      this.#walletAccountsInternalAtom.get(),
      this.#hardwareWalletPublicKeysAtom.get(),
    ])
    this.#walletAccounts = walletAccounts
    this.#hardwareWalletPublicKeys = hardwareWalletPublicKeys
    if (seedParams) {
      const defaultWalletAccount = walletAccounts[WalletAccount.DEFAULT_NAME]
      const { seedId, compatibilityMode } = seedParams

      if (
        !defaultWalletAccount.seedId ||
        (compatibilityMode && !defaultWalletAccount.compatibilityMode)
      ) {
        // if seedId exists, it's already been set by the migration
        const walletAccount = this.#update(WalletAccount.DEFAULT_NAME, {
          seedId,
          compatibilityMode,
        })

        await this.#persistWalletAccounts(
          { [WalletAccount.DEFAULT_NAME]: walletAccount },
          { useOptimisticWrite: true }
        )
      }
    }

    if (!this.#walletAccounts[WalletAccount.DEFAULT_NAME].seedId) {
      this.#logger.warn('wallet account missing seedId')
    }
  }

  clear = async () => {
    this.#loaded = pDefer()
    this.#walletAccounts = Object.create(null)
    await Promise.all([
      this.#walletAccountsInternalAtom.set(undefined),
      this.#hardwareWalletPublicKeysAtom.set(undefined),
    ])
  }

  #replaceAll = makeConcurrent(
    async ({ walletAccounts, accounts }) => {
      // This will replace all the locally stored hardware wallet public keys
      // with the ones provided by fusion without any attempt to merge inconsistent states.
      this.#hardwareWalletPublicKeys = accounts || createEmptyAccounts()

      await this.#loaded.promise
      const primarySeedId = await this.#wallet.getPrimarySeedId()

      // Warning: the following code between reading from this.#walletAccounts and writing back to it
      // needs to remain sync until this.#save or may lead to concurrency issues. "await" yields execution
      // and may allow .update(), .create(), etc to execute before
      // fusion syncing is done.

      const afterByName = Object.entries(walletAccounts).reduce((instances, [name, fields]) => {
        instances[name] = new WalletAccount({
          ...fields,
          ...(fields.source === EXODUS_SRC && {
            seedId: primarySeedId,
            compatibilityMode: this.#walletAccounts[WalletAccount.DEFAULT_NAME].compatibilityMode,
          }),
        })
        return instances
      }, {})

      const changes = getChanges({
        walletAccountInstancesBefore: Object.values(this.#walletAccounts),
        walletAccountInstancesAfter: Object.values(afterByName),
        supportedSources: this.#supportedSources,
      })

      const { added, disabled, updated, removedHardwareWalletAccounts } = changes
      if (![added, disabled, updated, removedHardwareWalletAccounts].some((arr) => arr.length)) {
        await this.#savePublicKeys()
        return
      }

      this.#walletAccounts = Object.fromEntries(
        Object.entries(this.#walletAccounts).filter(
          ([name]) => !removedHardwareWalletAccounts.includes(name)
        )
      )

      const updates = [
        ...updated.map((name) => this.#update(name, afterByName[name].toJSON())),
        ...added.map((name) => afterByName[name]),
        ...disabled.map((name) => this.#disable(name)),
      ]
        .flat()
        .reduce((merged, walletAccount) => {
          merged[walletAccount.toString()] = walletAccount

          return merged
        }, Object.create(null))

      this.#walletAccounts = { ...this.#walletAccounts, ...updates }
      await this.#save()
      await this.#savePublicKeys()
    },
    { concurrency: 1 }
  )

  update = async (name, data) => {
    await this.updateMany({ [name]: data })
  }

  updateMany = async (dataByName) => {
    const updated = Object.entries(dataByName).map(([name, data]) => {
      const walletAccount = this.#update(name, data)
      return [walletAccount.toString(), walletAccount]
    })

    await this.#persistWalletAccounts(Object.fromEntries(updated))
  }

  create = async (walletAccountData) => {
    const created = await this.createMany([walletAccountData])
    return created[0]
  }

  createMany = async (walletAccountsData) => {
    const walletAccounts = { ...this.#walletAccounts }
    const primarySeedId = await this.#wallet.getPrimarySeedId()

    const byUniqueFields = groupBy(walletAccounts, getUniqueTagForWalletAccount)

    const created = walletAccountsData.map((_data) => {
      const data = { ..._data }
      if (!data.source) data.source = WalletAccount.EXODUS_SRC

      if (data.source === WalletAccount.EXODUS_SRC) {
        assert(
          !data.seedId || data.seedId === primarySeedId,
          'expected seedId to be the primarySeedId for "exodus" accounts'
        )

        data.seedId = primarySeedId
        data.compatibilityMode = walletAccounts[WalletAccount.DEFAULT_NAME].compatibilityMode
      }

      if (shouldDeriveIndex(data)) {
        data.index = getNextIndex({
          walletAccounts,
          seedId: data.seedId,
          source: data.source,
          compatibilityMode: data.compatibilityMode,
          fillIndexGapsOnCreation: this.#fillIndexGapsOnCreation,
        })
      }

      const walletAccount = new WalletAccount(data)
      const exists = Boolean(walletAccounts[walletAccount.toString()])
      if (exists && !this.#fillIndexGapsOnCreation) {
        throw new Error(`WalletAccount already exists: ${walletAccount.toString()}`)
      }

      // allow updating existing ones
      if (!exists) {
        const tag = getUniqueTagForWalletAccount(walletAccount)
        const match = byUniqueFields[tag]?.[0]
        if (match) {
          throw new Error(
            `Already have walletAccount with same .source, .id, .seedId, and .index: ${JSON.stringify(
              match.toJSON()
            )}`
          )
        }
      }

      walletAccounts[walletAccount.toString()] = walletAccount
      return walletAccount
    })

    await this.#persistWalletAccounts(walletAccounts)

    return created
  }

  disable = async (name) => {
    await this.disableMany([name])
  }

  disableMany = async (walletAccountNames) => {
    walletAccountNames = walletAccountNames.filter(
      (walletAccount) => this.#walletAccounts[walletAccount]
    )

    if (walletAccountNames.length === 0) return

    const walletAccounts = { ...this.#walletAccounts }

    await this.setActive((oldValue) =>
      walletAccountNames.includes(oldValue) ? WalletAccount.DEFAULT_NAME : oldValue
    )

    for (const walletAccount of walletAccountNames) {
      if (walletAccounts[walletAccount].isHardware) {
        delete walletAccounts[walletAccount]
        delete this.#hardwareWalletPublicKeys[walletAccount]
      } else {
        walletAccounts[walletAccount] = this.#disable(walletAccount)
      }
    }

    if (equalWalletAccounts(this.#walletAccounts, walletAccounts)) return

    this.#walletAccounts = walletAccounts

    await this.#save()
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  removeMany = async (names) => {
    if (!this.#fillIndexGapsOnCreation) {
      throw new Error(
        'removeMany can only be used in conjunction with fillIndexGapsOnCreation. Please disable instead.'
      )
    }

    const walletAccounts = { ...this.#walletAccounts }
    const active = await this.#activeWalletAccountAtom.get()

    for (const name of names) {
      if (name === DEFAULT_WALLET_ACCOUNT) {
        throw new Error("Can't remove default walletAccount")
      }

      if (walletAccounts[name]?.isHardware) delete this.#hardwareWalletPublicKeys[name]
      delete walletAccounts[name]
    }

    if (equalWalletAccounts(this.#walletAccounts, walletAccounts)) return

    if (names.includes(active)) {
      await this.setActive(DEFAULT_WALLET_ACCOUNT)
    }

    this.#walletAccounts = walletAccounts

    await this.#save()
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  enableMany = async (walletAccountNames) => {
    const updates = walletAccountNames.reduce((acc, walletAccount) => {
      acc[walletAccount] = { enabled: true }
      return acc
    }, Object.create(null))

    await this.updateMany(updates)
  }

  enable = async (name) => {
    await this.enableMany([name])
  }

  #update = (walletAccount, newData) => {
    const before = this.#walletAccounts[walletAccount]

    if (!before) throw new Error(`${walletAccount} is not a known wallet account`)

    if (walletAccount === DEFAULT_WALLET_ACCOUNT.toString() && newData.enabled === false) {
      throw new Error("Can't disable default walletAccount")
    }

    const after = new WalletAccount({
      ...before,
      ...newData,
    })

    for (const key of ['source', 'id', 'index']) {
      assert(before[key] === after[key], `cannot change account ${key}`)
    }

    assert(
      !before.seedId || before.seedId === after.seedId,
      'seedId can only be set if previously undefined'
    )

    return after
  }

  #disable = (walletAccount) => {
    return this.#update(walletAccount, { enabled: false })
  }

  awaitSynced = async () => {
    await this.#channel.awaitProcessed()
  }

  /**
   * @deprecated Please use the walletAccountsAtom instead. Using this method can lead to subtle bugs
   */
  getAll = () => {
    return { ...this.#walletAccounts }
  }

  /**
   * @deprecated Please use the hardwareWalletPublicKeysAtom instead.
   */
  getAccounts = () => {
    return proxyFreeze(this.#hardwareWalletPublicKeys)
  }

  setAccounts = async (hardwareWalletPublicKeys) => {
    assert(hardwareWalletPublicKeys, `hardwareWalletPublicKeys must be passed to setAccounts`)
    this.#hardwareWalletPublicKeys = hardwareWalletPublicKeys
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  getEnabled = () =>
    Object.fromEntries(
      Object.entries(this.#walletAccounts).filter(([name, account]) => account.enabled)
    )

  /**
   * @deprecated Please use the walletAccountsAtom instead. Using this method can lead to subtle bugs
   */
  get = (walletAccount) => {
    return this.#walletAccounts[walletAccount]
  }

  getActive = async () => {
    return this.#activeWalletAccountAtom.get()
  }

  setActive = async (value) => {
    return this.#activeWalletAccountAtom.set(value)
  }

  getNextIndex = ({ seedId, source, compatibilityMode } = Object.create(null)) => {
    return getNextIndex({
      walletAccounts: { ...this.#walletAccounts },
      seedId,
      source,
      compatibilityMode,
      fillIndexGapsOnCreation: this.#fillIndexGapsOnCreation,
    })
  }
}

const factory = (args) => new WalletAccounts({ ...args })

const walletAccountsDefinition = {
  id: 'walletAccounts',
  type: 'module',
  factory,
  dependencies: [
    'logger',
    'fusion',
    'activeWalletAccountAtom',
    'hardwareWalletPublicKeysAtom',
    'config',
    'allWalletAccountsEver?',
    'wallet',
    'walletAccountsInternalAtom',
  ],
  public: true,
}

export default walletAccountsDefinition
