const EMPTY = {}
const resultFunction = (nfts, activeAccount) => nfts[activeAccount] || EMPTY

const activeNftsSelectorDefinition = {
  id: 'activeNfts',
  resultFunction,
  dependencies: [
    //
    { selector: 'all' },
    { module: 'walletAccounts', selector: 'active' },
  ],
}

export default activeNftsSelectorDefinition
