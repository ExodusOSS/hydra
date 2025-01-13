import { WalletAccount } from '@exodus/models'
import deepMerge from 'deepmerge'

const _channelData = {
  walletAccounts: [
    {
      walletAccounts: {
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      },
      accounts: {},
    },
  ],
  personalNotes: [{ data: { txId: '123', message: 'Rent' } }],
}

const createFusion = ({ channelData = _channelData }) => {
  let profile = { private: {} }
  const subscriptions = []

  return {
    subscribe: (callback) => {
      subscriptions.push(callback)
    },
    getProfile: async () => profile,
    mergeProfile: async (changes) => {
      profile = deepMerge(profile, changes)

      subscriptions.forEach((callback) => callback(profile))
    },
    channel: jest.fn((options) => {
      const response = {
        awaitProcessed: async () => {},
        push: jest.fn(),
      }

      if (channelData[options.channelName]?.length) {
        if (options.processBatch) {
          options.processBatch(channelData[options.channelName])
        } else {
          for (const data of channelData[options.channelName]) {
            options.processOne({ data })
          }
        }
      }

      return response
    }),
    clearStorage: async () => {},
  }
}

export default createFusion
