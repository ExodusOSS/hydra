import { isNumberUnit } from '@exodus/currency'
import type { Definition } from '@exodus/dependency-types'
import assert from 'minimalistic-assert'

const toNumberUnit = ({ value, currency }) => {
  assert(value, 'value is required')
  assert(currency, 'currency is required')
  if (isNumberUnit(value)) {
    return value
  }

  return currency.parse(value)
}

/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
const resolveSendParams = (assetName, asset, options) => {
  const { currency, baseAsset } = asset

  if (options.receiver.amount) {
    options.receiver.amount = toNumberUnit({
      value: options.receiver.amount,
      currency,
    })
  }

  return {
    ...options,
    ...options.receiver,
    assetName,
    asset,
    baseAsset,
    options,
  }
}
/* eslint-enable @exodus/mutable/no-param-reassign-prop-only */

export type SendResult = {
  txId: string
}

type SendOptions = {
  assetName: string
  // wallet account identifier
  walletAccount: string
  feeAmount: string
  receiver: {
    address: string
    amount: string
  }
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

    const sendParams = resolveSendParams(assetName, asset, options)

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
