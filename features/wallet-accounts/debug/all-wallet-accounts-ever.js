import lodash from 'lodash'

const { merge } = lodash

const createAllWalletAccountsEver = () => {
  let tailChannel
  const grantChannelAccess = ({ tail }) => {
    tailChannel = tail
  }

  return {
    grantChannelAccess,
    get: async () => {
      const history = await tailChannel()
      return merge(...history.map(({ walletAccounts }) => walletAccounts))
    },
  }
}

const allWalletAccountsEverDefinition = {
  id: 'allWalletAccountsEver',
  type: 'module',
  factory: createAllWalletAccountsEver,
  dependencies: [],
}

export default allWalletAccountsEverDefinition
