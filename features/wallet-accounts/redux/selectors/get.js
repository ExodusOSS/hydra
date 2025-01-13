const resultFunction = (walletAccounts) => (name) => walletAccounts[name]

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'get',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}
