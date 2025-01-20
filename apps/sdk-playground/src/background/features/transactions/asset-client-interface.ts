type SignedTransactionData = {
  rawTx: Buffer
  txId: string
  [key: string]: unknown
}

type SignTransactionFn = ({
  assetName,
  unsignedTx,
}: {
  assetName: string
  unsignedTx: any
}) => Promise<SignedTransactionData>

type AssetClientInterface = {
  signTransaction: SignTransactionFn
  [key: string]: unknown
}

const createAssetClientInterfaceWithCustomSigner = ({
  assetClientInterface,
  signTransaction,
}: {
  assetClientInterface: AssetClientInterface
  signTransaction: SignTransactionFn
}): AssetClientInterface => {
  return new Proxy(assetClientInterface, {
    get(target, property, receiver) {
      if (property === 'signTransaction') {
        return (...args: Parameters<SignTransactionFn>) => signTransaction.apply(target, args)
      }

      const value = Reflect.get(target, property, receiver)
      if (value instanceof Function) {
        return (...args) => value.apply(target, args)
      }

      return value
    },
  })
}

export default createAssetClientInterfaceWithCustomSigner
