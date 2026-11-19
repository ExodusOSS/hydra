import { difference, intersection, keyBy } from '@exodus/basic-utils'
import {
  CUSTODIAL_SOURCES,
  SOFTWARE_SEED_SOURCES,
} from '@exodus/models/lib/wallet-account/index.js'
import type { WalletAccount } from '@exodus/models'

const getName = (walletAccount: WalletAccount) => walletAccount.toString()

export const getChanges = ({
  walletAccountInstancesBefore,
  walletAccountInstancesAfter,
  supportedSources,
}: GetChangesParams) => {
  const filterSupportedWallets = (w: WalletAccount) => supportedSources.has(w.source)
  // TODO: Remove after custodial wallets sync
  walletAccountInstancesBefore = walletAccountInstancesBefore.filter(filterSupportedWallets)
  walletAccountInstancesAfter = walletAccountInstancesAfter.filter(filterSupportedWallets)

  const byNameBefore = keyBy(walletAccountInstancesBefore, getName)
  const byNameAfter = keyBy(walletAccountInstancesAfter, getName)
  const namesBefore = walletAccountInstancesBefore.map(getName)
  const namesAfter = walletAccountInstancesAfter.map(getName)
  const namesEnabledBefore = walletAccountInstancesBefore.filter((w) => w.enabled).map(getName)
  const namesEnabledAfter = walletAccountInstancesAfter.filter((w) => w.enabled).map(getName)

  const hardwareNamesBefore = walletAccountInstancesBefore.filter((w) => w.isHardware).map(getName)
  const hardwareNamesAfter = walletAccountInstancesAfter.filter((w) => w.isHardware).map(getName)
  const removedHardwareWalletAccounts = difference(hardwareNamesBefore, hardwareNamesAfter)

  return {
    disabled: difference(
      difference(namesEnabledBefore, namesEnabledAfter),
      removedHardwareWalletAccounts
    ).filter((name) => namesAfter.includes(name)),
    added: difference(namesAfter, namesBefore),
    updated: intersection(namesBefore, namesAfter).filter(
      (name) => !byNameBefore[name]!.equals(byNameAfter[name]!)
    ),
    removedHardwareWalletAccounts,
  }
}

export const createEmptyAccounts = (): Record<string, never> => Object.create(null)

export const shouldDeriveIndex = (walletAccountData: { index?: number; source: string }) =>
  typeof walletAccountData.index !== 'number' &&
  !(CUSTODIAL_SOURCES as readonly string[]).includes(walletAccountData.source)

export const getNextIndex = ({
  walletAccounts,
  seedId,
  source,
  compatibilityMode,
  fillIndexGapsOnCreation,
}: GetNextIndexParams) => {
  const existing = Object.values(walletAccounts)
    .filter(
      (w) =>
        w.source === source &&
        w.compatibilityMode === compatibilityMode &&
        w.seedId === seedId &&
        !w.id &&
        (!fillIndexGapsOnCreation || w.enabled)
    )
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

  if (fillIndexGapsOnCreation) {
    return (
      [...existing.keys()].find((i) => existing[Number(i)]?.index !== Number(i)) ?? existing.length
    )
  }

  const indexes = existing
    .map(({ index }) => index)
    .filter((i): i is number => typeof i === 'number')
  return Math.max(-1, ...indexes) + 1
}

export const containWalletAccounts = (
  walletAccounts: Record<string, WalletAccount>,
  otherWalletAccounts: Record<string, WalletAccount>
) => {
  return Object.entries(otherWalletAccounts).every(([key, otherWalletAccount]) => {
    const walletAccount = walletAccounts[key]
    return walletAccount && otherWalletAccount.equals(walletAccount)
  })
}

export const equalWalletAccounts = (
  walletAccounts: Record<string, WalletAccount>,
  otherWalletAccounts: Record<string, WalletAccount>
) => {
  if (Object.keys(walletAccounts).length === Object.keys(otherWalletAccounts).length) {
    return containWalletAccounts(walletAccounts, otherWalletAccounts)
  }

  return false
}

export const getUniqueTagForWalletAccount = ({ source, id, seedId, index }: UniqueTagParams) => {
  // software-seed sources share a derivation domain (same seedId+index = same key), so omit source
  const isSoftwareSeed = !!source && (SOFTWARE_SEED_SOURCES as readonly string[]).includes(source)
  const normalizedSource = isSoftwareSeed ? '' : (source ?? '')
  return ['source', normalizedSource, 'id', id, 'seedId', seedId, 'index', index].join('_')
}

type GetChangesParams = {
  walletAccountInstancesBefore: WalletAccount[]
  walletAccountInstancesAfter: WalletAccount[]
  supportedSources: Set<string>
}

type GetNextIndexParams = {
  walletAccounts: Record<string, WalletAccount>
  seedId: string
  source: string
  compatibilityMode: string | undefined
  fillIndexGapsOnCreation: boolean
}

type UniqueTagParams = {
  source?: string
  id?: string | number
  seedId?: string
  index?: number | null
}
