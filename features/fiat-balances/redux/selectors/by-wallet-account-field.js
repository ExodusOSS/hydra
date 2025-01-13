const resultFunction = (data) => data.byWalletAccount

const byWalletAccountField = {
  id: 'byWalletAccountField',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default byWalletAccountField
