declare module '@exodus/storage-memory'
declare module '@exodus/dependency-injection'
declare module '@exodus/dependency-preprocessors'
declare module '@exodus/dependency-preprocessors/*'
declare module '@exodus/asset-lib'
declare module '@exodus/basic-utils'
declare module '@exodus/key-utils'
declare module '@exodus/assets'
declare module '@exodus/bitcoin-plugin'
declare module '@exodus/solana-plugin'

declare module '@exodus/key-identifier' {
  type ConstructorParams = {
    derivationPath: string
    keyType: string
    derivationAlgorithm: string
  }

  export default class KeyIdentifier {
    derivationPath: string
    keyType: string
    derivationAlgorithm: string

    constructor(params: ConstructorParams)
  }
}
