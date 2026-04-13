import type { Definition } from '@exodus/dependency-types'
import type { WalletAccount } from '@exodus/models'

// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { merge } = lodash

const createAllWalletAccountsEver = () => {
  let tailChannel: (() => Promise<HistoryEntry[]>) | undefined
  const grantChannelAccess = ({ tail }: { tail: () => Promise<HistoryEntry[]> }) => {
    tailChannel = tail
  }

  return {
    grantChannelAccess,
    get: async () => {
      if (!tailChannel) throw new Error('channel access not granted')
      const history = await tailChannel()
      const entries = history.map(({ walletAccounts }) => walletAccounts)
      return merge({} as Record<string, WalletAccount>, ...entries)
    },
  }
}

const allWalletAccountsEverDefinition = {
  id: 'allWalletAccountsEver',
  type: 'module',
  factory: createAllWalletAccountsEver,
  dependencies: [],
} as const satisfies Definition

type HistoryEntry = { walletAccounts: Record<string, WalletAccount> }

export default allWalletAccountsEverDefinition
