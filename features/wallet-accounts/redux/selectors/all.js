// can't we just do Object.values(data) where data comes from { selector: 'data' }?
const resultFunction = (walletAccounts, get) => walletAccounts.map(get)

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'all',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
  ],
}
