import { WalletAccount, WalletAccountSet } from '@exodus/models'
import type { Definition } from '@exodus/dependency-types'
import type { ReadonlyAtom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'
import type {
  WalletAccountMap,
  HardwareWalletPublicKeys,
  WalletAccountsInternalAtom,
  ActiveWalletAccountAtom,
  HardwareWalletPublicKeysAtom,
  ExternalWalletAddressesAtom,
  WalletAccountsData,
  AllWalletAccountsEver,
  Wallet,
} from '../types.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
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
import { EXODUS_SRC, type WalletAccountParams } from '@exodus/models/lib/wallet-account/index.js'

const { groupBy } = lodash

const DEFAULT_WALLET_ACCOUNT = WalletAccount.DEFAULT_NAME

const walletAccountsChannel = {
  type: 'walletAccounts',
  channelName: 'walletAccounts',
  syncStateKey: 'sync:syncstate:walletAccounts',
  startFromLatest: true,
}

const updateWalletAccount = (
  walletAccounts: Record<string, WalletAccount> = Object.create(null),
  walletAccount: string,
  newData: Record<string, unknown>
) => {
  const before = walletAccounts[walletAccount]

  if (!before) throw new Error(`${walletAccount} is not a known wallet account`)

  if (walletAccount === DEFAULT_WALLET_ACCOUNT.toString() && newData.enabled === false) {
    throw new Error("Can't disable default walletAccount")
  }

  const after = new WalletAccount({
    ...before,
    ...newData,
  })

  for (const key of ['source', 'id', 'index']) {
    assert(
      (before as unknown as Record<string, unknown>)[key] ===
        (after as unknown as Record<string, unknown>)[key],
      `cannot change account ${key}`
    )
  }

  assert(
    !before.seedId || before.seedId === after.seedId,
    'seedId can only be set if previously undefined'
  )

  return after
}

export class WalletAccounts {
  #logger: Logger
  #walletAccountsInternalAtom: WalletAccountsInternalAtom
  #wallet: Wallet
  #activeWalletAccountAtom: ActiveWalletAccountAtom
  #hardwareWalletPublicKeysAtom: HardwareWalletPublicKeysAtom
  #externalWalletAddressesAtom: ExternalWalletAddressesAtom
  #rawFusionData: FusionData = {}
  #hardwareWalletPublicKeys: HardwareWalletPublicKeys = createEmptyAccounts()
  #channel: FusionChannel
  #supportedSources: Set<string>
  #fillIndexGapsOnCreation: boolean
  #loaded = pDefer()
  #fromSafeReportAtom: ReadonlyAtom<boolean> | undefined

  constructor({
    logger,
    fusion,
    walletAccountsInternalAtom,
    wallet,
    activeWalletAccountAtom,
    hardwareWalletPublicKeysAtom,
    externalWalletAddressesAtom,
    allWalletAccountsEver,
    fromSafeReportAtom,
    config,
  }: Dependencies) {
    const { allowedSources: supportedSources, fillIndexGapsOnCreation } = config
    this.#logger = logger
    this.#walletAccountsInternalAtom = walletAccountsInternalAtom
    this.#wallet = wallet
    this.#activeWalletAccountAtom = activeWalletAccountAtom
    this.#hardwareWalletPublicKeysAtom = hardwareWalletPublicKeysAtom
    this.#externalWalletAddressesAtom = externalWalletAddressesAtom
    this.#fromSafeReportAtom = fromSafeReportAtom
    this.#fillIndexGapsOnCreation = fillIndexGapsOnCreation

    this.#supportedSources = new Set(supportedSources)

    this.#channel = fusion.channel({
      ...walletAccountsChannel,
      processOne: async ({ data }: { data: FusionData }) => {
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
    if (this.#fromSafeReportAtom) {
      const fromSafeReport = await this.#fromSafeReportAtom.get()
      if (fromSafeReport) return
    }

    try {
      const channel = await this.#getChannel()
      const fusionWalletAccounts = new WalletAccountSet(this.#rawFusionData.walletAccounts || {})
      const walletAccounts = (await this.#walletAccountsInternalAtom.get()) ?? Object.create(null)
      const isCustodialWallet = (name: string) =>
        (walletAccounts as WalletAccountMap)[name]?.isCustodial

      const isDeletedHardwareWallet = (name: string) => {
        const isHardware = fusionWalletAccounts.get(name)?.isHardware
        return (
          !(walletAccounts as WalletAccountMap)[name] && (isHardware || !name.startsWith('exodus'))
        )
      }

      const isKnownByPlatform = (name: string) => {
        return this.#supportedSources.has(fusionWalletAccounts.get(String(name))?.source ?? '')
      }

      // if an account is not handled by the current platform, we have to make sure that we keep
      // it and not remove it from fusion
      const accountPicker = (_: unknown, name: string) =>
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
            fusionWalletAccounts.update(walletAccounts).toJSON(),
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

  #getInternalWalletAccountsWithFallback = async () => {
    return (await this.#walletAccountsInternalAtom.get()) ?? Object.create(null)
  }

  #persistWalletAccounts = async (
    walletAccounts: Record<string, WalletAccount>,
    options: { useOptimisticWrite?: boolean } = {}
  ) => {
    const currentWalletAccounts = await this.#walletAccountsInternalAtom.get()

    if (currentWalletAccounts && containWalletAccounts(currentWalletAccounts, walletAccounts)) {
      return
    }

    const updatedWalletAccounts = { ...currentWalletAccounts, ...walletAccounts }
    await this.#walletAccountsInternalAtom.set(updatedWalletAccounts)

    if (options.useOptimisticWrite) {
      void this.#updateFusion()
    } else {
      await this.#updateFusion()
    }
  }

  #savePublicKeys = pDebounce(async () => {
    // Desktop IPC does not support serializing the proxies - typically from proxy-freeze'd objects from atoms
    const hardwareWalletPublicKeysUnproxied = JSON.parse(
      JSON.stringify(this.#hardwareWalletPublicKeys)
    )
    await this.#hardwareWalletPublicKeysAtom.set(hardwareWalletPublicKeysUnproxied)
  }, 0)

  load = async () => {
    this.#hardwareWalletPublicKeys = await this.#hardwareWalletPublicKeysAtom.get()

    this.#loaded.resolve()
  }

  clear = async () => {
    this.#loaded = pDefer()
    await Promise.all([
      this.#walletAccountsInternalAtom.set(undefined),
      this.#hardwareWalletPublicKeysAtom.reset(),
      this.#externalWalletAddressesAtom.reset(),
    ])
  }

  #replaceAll = makeConcurrent(
    async ({
      walletAccounts,
      accounts,
    }: {
      walletAccounts: Record<string, Record<string, unknown>>
      accounts?: HardwareWalletPublicKeys
    }) => {
      // This will replace all the locally stored hardware wallet public keys
      // with the ones provided by fusion without any attempt to merge inconsistent states.
      this.#hardwareWalletPublicKeys = accounts || createEmptyAccounts()

      await this.#loaded.promise
      const primarySeedId = await this.#wallet.getPrimarySeedId()

      const currentWalletAccounts = (await this.#getInternalWalletAccountsWithFallback()) as Record<
        string,
        WalletAccount
      >
      // Warning: the following code between reading from currentWalletAccounts and writing back to it
      // needs to remain sync until this.#save or may lead to concurrency issues. "await" yields execution
      // and may allow .update(), .create(), etc to execute before
      // fusion syncing is done.
      const afterByName = Object.entries(walletAccounts).reduce(
        (
          instances: Record<string, WalletAccount>,
          [name, fields]: [string, Record<string, unknown>]
        ) => {
          instances[name] = new WalletAccount({
            ...fields,
            ...(fields.source === EXODUS_SRC && {
              seedId: primarySeedId,
              compatibilityMode:
                currentWalletAccounts[WalletAccount.DEFAULT_NAME]?.compatibilityMode,
            }),
          } as WalletAccountParams)
          return instances
        },
        {} as Record<string, WalletAccount>
      )

      const changes = getChanges({
        walletAccountInstancesBefore: Object.values(currentWalletAccounts),
        walletAccountInstancesAfter: Object.values(afterByName),
        supportedSources: this.#supportedSources,
      })

      const { added, disabled, updated, removedHardwareWalletAccounts } = changes
      if (![added, disabled, updated, removedHardwareWalletAccounts].some((arr) => arr.length)) {
        await this.#savePublicKeys()
        return
      }

      let updatedWalletAccounts: Record<string, WalletAccount> = Object.fromEntries(
        Object.entries(currentWalletAccounts).filter(
          ([name]) => !removedHardwareWalletAccounts.includes(name)
        )
      )

      const updates = [
        ...updated.map((name) =>
          updateWalletAccount(updatedWalletAccounts, name, afterByName[name]!.toJSON())
        ),
        ...added.map((name) => afterByName[name]!),
        ...disabled.map((name) => this.#disableWalletAccount(updatedWalletAccounts, name)),
      ]
        .flat()
        .reduce(
          (merged: Record<string, WalletAccount>, walletAccount) => {
            merged[walletAccount.toString()] = walletAccount

            return merged
          },
          Object.create(null) as Record<string, WalletAccount>
        )

      updatedWalletAccounts = { ...updatedWalletAccounts, ...updates }
      await this.#walletAccountsInternalAtom.set(updatedWalletAccounts)
      await this.#savePublicKeys()
    },
    { concurrency: 1 }
  )

  update = async (name: string, data: Record<string, unknown>) => {
    await this.updateMany({ [name]: data })
  }

  updateMany = async (dataByName: Record<string, Record<string, unknown>>) => {
    const currentWalletAccounts = await this.#getInternalWalletAccountsWithFallback()
    const updated = Object.entries(dataByName).map(([name, data]) => {
      const walletAccount = updateWalletAccount(currentWalletAccounts, name, data)
      return [walletAccount.toString(), walletAccount]
    })

    await this.#persistWalletAccounts(Object.fromEntries(updated))
  }

  create = async (walletAccountData: WalletAccountsData) => {
    const created = await this.createMany([walletAccountData])
    return created[0]
  }

  createMany = makeConcurrent(
    async (
      walletAccountsData: WalletAccountsData[],
      options?: { useOptimisticWrite?: boolean }
    ) => {
      const currentWalletAccounts = await this.#getInternalWalletAccountsWithFallback()
      const walletAccounts = { ...currentWalletAccounts }
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
          // mirror compatibilityMode from default account unless we create it
          data.compatibilityMode = walletAccounts[WalletAccount.DEFAULT_NAME]
            ? walletAccounts[WalletAccount.DEFAULT_NAME].compatibilityMode
            : data.compatibilityMode
        }

        if (shouldDeriveIndex(data as { index?: number; source: string })) {
          data.index = getNextIndex({
            walletAccounts,
            seedId: data.seedId ?? '',
            source: data.source ?? WalletAccount.EXODUS_SRC,
            compatibilityMode: data.compatibilityMode,
            fillIndexGapsOnCreation: this.#fillIndexGapsOnCreation,
          })
        }

        const walletAccount = new WalletAccount(data as WalletAccountParams)
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

      await this.#persistWalletAccounts(walletAccounts, options)

      return created
    },
    { concurrency: 1 }
  )

  disable = async (name: string) => {
    await this.disableMany([name])
  }

  disableMany = async (walletAccountNames: string[]) => {
    const currentWalletAccounts = await this.#getInternalWalletAccountsWithFallback()
    walletAccountNames = walletAccountNames.filter(
      (walletAccount) => currentWalletAccounts[walletAccount]
    )

    if (walletAccountNames.length === 0) return

    const walletAccounts = { ...currentWalletAccounts }

    await this.setActive((oldValue) =>
      walletAccountNames.includes(oldValue) ? WalletAccount.DEFAULT_NAME : oldValue
    )

    for (const walletAccount of walletAccountNames) {
      if (walletAccounts[walletAccount].isHardware) {
        delete walletAccounts[walletAccount]
        delete this.#hardwareWalletPublicKeys[walletAccount]
      } else {
        walletAccounts[walletAccount] = this.#disableWalletAccount(walletAccounts, walletAccount)
      }
    }

    if (equalWalletAccounts(currentWalletAccounts, walletAccounts)) return

    await this.#walletAccountsInternalAtom.set(walletAccounts)
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  removeMany = async (names: string[]) => {
    if (!this.#fillIndexGapsOnCreation) {
      throw new Error(
        'removeMany can only be used in conjunction with fillIndexGapsOnCreation. Please disable instead.'
      )
    }

    const currentWalletAccounts = await this.#getInternalWalletAccountsWithFallback()
    const walletAccounts = { ...currentWalletAccounts }
    const active = await this.#activeWalletAccountAtom.get()

    for (const name of names) {
      if (name === DEFAULT_WALLET_ACCOUNT) {
        throw new Error("Can't remove default walletAccount")
      }

      if (walletAccounts[name]?.isHardware) delete this.#hardwareWalletPublicKeys[name]
      delete walletAccounts[name]
    }

    if (equalWalletAccounts(currentWalletAccounts, walletAccounts)) return

    if (names.includes(active)) {
      await this.setActive(DEFAULT_WALLET_ACCOUNT)
    }

    await this.#walletAccountsInternalAtom.set(walletAccounts)
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  enableMany = async (walletAccountNames: string[]) => {
    const updates = walletAccountNames.reduce((acc, walletAccount) => {
      acc[walletAccount] = { enabled: true }
      return acc
    }, Object.create(null))

    await this.updateMany(updates)
  }

  enable = async (name: string) => {
    await this.enableMany([name])
  }

  #disableWalletAccount = (
    walletAccounts: Record<string, WalletAccount>,
    walletAccount: string
  ) => {
    return updateWalletAccount(walletAccounts, walletAccount, { enabled: false })
  }

  awaitSynced = async () => {
    await this.#channel.awaitProcessed()
  }

  getAll = async () => {
    return this.#walletAccountsInternalAtom.get()
  }

  /**
   * @deprecated Please use the hardwareWalletPublicKeysAtom instead.
   */
  getAccounts = () => {
    return proxyFreeze(this.#hardwareWalletPublicKeys)
  }

  setAccounts = async (hardwareWalletPublicKeys: HardwareWalletPublicKeys) => {
    assert(hardwareWalletPublicKeys, `hardwareWalletPublicKeys must be passed to setAccounts`)
    this.#hardwareWalletPublicKeys = hardwareWalletPublicKeys
    await this.#savePublicKeys()
    await this.#updateFusion()
  }

  getEnabled = async () => {
    const walletAccounts = (await this.#getInternalWalletAccountsWithFallback()) as Record<
      string,
      WalletAccount
    >
    return Object.fromEntries(
      Object.entries(walletAccounts).filter(([, account]) => account.enabled)
    )
  }

  get = async (walletAccount: string) => {
    const walletAccounts = await this.#getInternalWalletAccountsWithFallback()
    return walletAccounts[walletAccount]
  }

  getActive = async () => {
    return this.#activeWalletAccountAtom.get()
  }

  setActive = async (value: string | ((oldValue: string) => string)) => {
    if (typeof value === 'function') {
      return this.#activeWalletAccountAtom.set(value)
    }

    return this.#activeWalletAccountAtom.set(value)
  }

  setExternalAddress = async ({
    walletAccount,
    assetName,
    address,
  }: {
    walletAccount: string
    assetName: string
    address: string
  }) => {
    await this.#externalWalletAddressesAtom.set((current) => ({
      ...current,
      [walletAccount]: { ...current[walletAccount], [assetName]: address },
    }))
  }

  removeExternalAddress = async ({
    walletAccount,
    assetName,
  }: {
    walletAccount: string
    assetName: string
  }) => {
    await this.#externalWalletAddressesAtom.set((current) => {
      const { [assetName]: _, ...rest } = current[walletAccount] ?? {}
      return { ...current, [walletAccount]: rest }
    })
  }

  getNextIndex = async (
    { seedId = '', source = '', compatibilityMode }: GetNextIndexParams = Object.create(null)
  ) => {
    const walletAccounts = (await this.#getInternalWalletAccountsWithFallback()) as Record<
      string,
      WalletAccount
    >
    return getNextIndex({
      walletAccounts: { ...walletAccounts },
      seedId,
      source,
      compatibilityMode,
      fillIndexGapsOnCreation: this.#fillIndexGapsOnCreation,
    })
  }
}

const factory = (args: ConstructorParameters<typeof WalletAccounts>[0]): WalletAccounts =>
  new WalletAccounts({ ...args })

const walletAccountsDefinition = {
  id: 'walletAccounts',
  type: 'module',
  factory,
  dependencies: [
    'logger',
    'fusion',
    'activeWalletAccountAtom',
    'hardwareWalletPublicKeysAtom',
    'externalWalletAddressesAtom',
    'config',
    'allWalletAccountsEver?',
    'wallet',
    'walletAccountsInternalAtom',
    'fromSafeReportAtom?',
  ],
  public: true,
} as const satisfies Definition

type Dependencies = {
  logger: Logger
  fusion: Fusion
  walletAccountsInternalAtom: WalletAccountsInternalAtom
  wallet: Wallet
  activeWalletAccountAtom: ActiveWalletAccountAtom
  hardwareWalletPublicKeysAtom: HardwareWalletPublicKeysAtom
  externalWalletAddressesAtom: ExternalWalletAddressesAtom
  allWalletAccountsEver?: AllWalletAccountsEver
  fromSafeReportAtom?: ReadonlyAtom<boolean>
  config: { allowedSources: string[]; fillIndexGapsOnCreation: boolean }
}

type GetNextIndexParams = {
  seedId?: string
  source?: string
  compatibilityMode?: string
}

interface FusionChannel {
  awaitProcessed(): Promise<void>
  push(data: { type: string; data: Record<string, unknown> }): Promise<void>
  tail(): Promise<Record<string, unknown>[]>
}

interface Fusion {
  channel(config: {
    type: string
    channelName: string
    syncStateKey: string
    startFromLatest: boolean
    processOne: (event: { data: FusionData }) => Promise<void>
  }): FusionChannel
}

interface FusionData {
  walletAccounts?: Record<string, Record<string, unknown>>
  accounts?: HardwareWalletPublicKeys
  [key: string]: unknown
}

export default walletAccountsDefinition
