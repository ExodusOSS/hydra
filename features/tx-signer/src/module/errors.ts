export class UnsupportedWalletAccountSource extends Error {
  constructor() {
    super('unable to sign for this wallet account source')
  }
}
