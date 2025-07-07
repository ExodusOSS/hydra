import { compute, combine, filter, enforceObservableRules } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import lodash from 'lodash'

import getSeedDerivedId from './get-seed-derived-id.js'

const { uniq } = lodash

const getUniqueExtraSeedIds = ({ primarySeedId, accounts }) => {
  const seedIds = Object.values(accounts)
    .filter(({ source }) => {
      return source === WalletAccount.SEED_SRC
    })
    .map(({ seedId }) => seedId)

  const extraSeedIds = seedIds.filter((seedId) => seedId !== primarySeedId)
  return uniq(extraSeedIds)
}

const getSeedIdToUserIdMap = async ({ seedIds, keychain, identifier }) => {
  const userIds = await Promise.all(
    seedIds.map(async (seedId) => {
      const userId = await getSeedDerivedId({
        keychain,
        identifier,
        seedId,
      })
      return [seedId, userId]
    })
  )

  return Object.fromEntries(userIds)
}

const createAnalyticsExtraSeedsUserIdsAtom = ({
  keychain,
  lockedAtom,
  primarySeedIdAtom,
  config: { keyIdentifier },
  enabledWalletAccountsAtom,
}) => {
  const rawCombinedAtom = combine({
    primarySeedId: primarySeedIdAtom,
    accounts: enabledWalletAccountsAtom,
    locked: lockedAtom,
  })

  const combinedAtom = filter(rawCombinedAtom, ({ locked }) => !locked)

  const selector = async ({ primarySeedId, accounts }) => {
    const seedIds = getUniqueExtraSeedIds({ primarySeedId, accounts })
    return getSeedIdToUserIdMap({ seedIds, keychain, identifier: keyIdentifier })
  }

  const atom = compute({
    atom: combinedAtom,
    selector,
  })

  return enforceObservableRules({
    ...atom,
    makeGetNonConcurrent: true,
  })
}

const analyticsExtraSeedsUserIdsAtomDefinition = {
  id: 'analyticsExtraSeedsUserIdsAtom',
  type: 'atom',
  factory: createAnalyticsExtraSeedsUserIdsAtom,
  dependencies: [
    'config',
    'lockedAtom',
    'primarySeedIdAtom',
    'keychain',
    'enabledWalletAccountsAtom',
  ],
  public: true,
}

export default analyticsExtraSeedsUserIdsAtomDefinition
