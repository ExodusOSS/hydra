const createDataInitialState = () => ({
  totals: {
    // balance: NumberUnit,
    // someSubBalance: NumberUnit, // e.g. spendableBalance
  },
  byWalletAccount: {
    // [walletAccount]: { balance: NumberUnit},
  },
  byAssetSource: {
    // [walletAccount]: {
    //   [assetName]: { balance: NumberUnit},
    // }
  },
  byBaseAssetSource: {
    // [walletAccount]: {
    //   [assetName]: { balance: NumberUnit},
    // }
  },
})

const initialState = {
  loaded: false,
  optimisticLoaded: false,
  data: createDataInitialState(),
  optimisticData: createDataInitialState(),
}

export default initialState
