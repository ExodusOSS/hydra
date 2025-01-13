import type walletApiDefinition from './api/index.js'

type Config = {
  maxExtraSeeds?: number
  validMnemonicLengths?: number[]
}

declare const wallet: (config?: Config) => {
  id: 'wallet'
  definitions: [{ definition: typeof walletApiDefinition }]
}

export default wallet
