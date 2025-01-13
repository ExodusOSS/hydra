export class UnsupportedWalletAccountSource extends Error {
  constructor(source: string) {
    super(`unable to sign for this wallet account source: ${source}`)
  }
}
