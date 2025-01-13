import { difference, intersection, keyBy } from '@exodus/basic-utils'
import { CUSTODIAL_SOURCES } from '@exodus/models/lib/wallet-account/index.js'

const getName = (walletAccount) => walletAccount.toString()

export const getChanges = ({
  walletAccountInstancesBefore,
  walletAccountInstancesAfter,
  supportedSources,
}) => {
  const filterSupportedWallets = (w) => supportedSources.has(w.source)
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
    ),
    added: difference(namesAfter, namesBefore),
    updated: intersection(namesBefore, namesAfter).filter(
      (name) => !byNameBefore[name].equals(byNameAfter[name])
    ),
    removedHardwareWalletAccounts,
  }
}

export const createEmptyAccounts = () => Object.create(null)

export const shouldDeriveIndex = (walletAccountData) =>
  typeof walletAccountData.index !== 'number' &&
  !CUSTODIAL_SOURCES.includes(walletAccountData.source)

export const getNextIndex = ({
  walletAccounts,
  seedId,
  source,
  compatibilityMode,
  fillIndexGapsOnCreation,
}) => {
  const existing = Object.values(walletAccounts)
    .filter(
      (w) =>
        w.source === source &&
        w.compatibilityMode === compatibilityMode &&
        w.seedId === seedId &&
        !w.id &&
        (!fillIndexGapsOnCreation || w.enabled)
    )
    .sort((a, b) => a.index - b.index)

  if (fillIndexGapsOnCreation) {
    return [...existing.keys()].find((i) => existing[i].index !== i) ?? existing.length
  }

  const indexes = existing.map(({ index }) => index)
  return Math.max(...indexes, -1) + 1
}

export const containWalletAccounts = (walletAccounts, otherWalletAccounts) => {
  return Object.entries(otherWalletAccounts).every(([key, otherWalletAccount]) => {
    const walletAccount = walletAccounts[key]
    return walletAccount && otherWalletAccount.equals(walletAccount)
  })
}

export const equalWalletAccounts = (walletAccounts, otherWalletAccounts) => {
  if (Object.keys(walletAccounts).length === Object.keys(otherWalletAccounts).length) {
    return containWalletAccounts(walletAccounts, otherWalletAccounts)
  }

  return false
}

export const getUniqueTagForWalletAccount = ({ id, seedId, index }) =>
  ['id', id, 'seedId', seedId, 'index', index].join('_')
