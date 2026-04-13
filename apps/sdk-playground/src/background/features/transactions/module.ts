import { omit } from '@exodus/basic-utils'
import type { Definition } from '@exodus/dependency-types'

export type SendResult = {
  txId: string
}

type SendOptions = {
  assetName: string
  // wallet account identifier
  walletAccount: string
  feeAmount: string
  address: string
  amount: string
  customGasLimit?: string
  txInput?: string
  keepTxInput?: boolean
}

const createTransactions = ({ assetsModule }) => {
  const send = async ({ assetName, ...options }: SendOptions): Promise<SendResult> => {
    const asset = assetsModule.getAsset(assetName)

    const baseAsset = asset.baseAsset

    if (!baseAsset.api?.sendTx) {
      throw new Error(`Cannot find 'sendTx' function for '${asset.name}'`)
    }

    // see https://github.com/ExodusMovement/exodus-mobile/blob/fd908397067740a410ad9a505bce98bcc7b3b11f/src/_local_modules/simple-tx/tx-send.js#L24
    const sendParams = {
      ...omit(options, ['receiver', 'feeOpts']),
      ...omit(options.feeOpts, ['unsignedTx']),
      asset,
    }

    try {
      return await baseAsset.api.sendTx(sendParams)
    } catch (error: any) {
      console.error(`Cannot send tx for asset '${assetName}'. Error ${error.message}`, error)
      throw error
    }
  }

  const broadcast = async ({ assetName, signedTx }) => {
    const asset = assetsModule.getAsset(assetName)

    const baseAsset = asset.baseAsset

    if (!baseAsset.api?.broadcastTx) {
      throw new Error(`Cannot find 'broadcastTx' function for '${asset.name}'`)
    }

    try {
      return await baseAsset.api.broadcastTx(signedTx)
    } catch (error: any) {
      console.error(`Cannot broadcast tx for asset '${assetName}'. Error ${error.message}`, error)
      throw error
    }
  }

  return {
    send,
    broadcast,
  }
}

const transactionsDefinition = {
  id: 'transactions',
  type: 'module',
  factory: createTransactions,
  dependencies: ['assetsModule'],
} as const satisfies Definition

export default transactionsDefinition
