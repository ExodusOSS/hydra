import { createSelector } from 'reselect'
import { OrderSet } from '@exodus/models'
import { memoizeByAssetSource } from '../utils/memoize.js'

export const resultFunc = ({ orderSet, walletAccount, assetName }) =>
  OrderSet.fromArray(
    [...orderSet].filter(
      ({ toWalletAccount, toAsset }) => toAsset === assetName && walletAccount === toWalletAccount
    )
  )

const createAssetSourceIncomingOrdersSelectorCreator = ({ ordersInProgressSelector }) =>
  memoizeByAssetSource(({ walletAccount, assetName }) =>
    createSelector(ordersInProgressSelector, (orderSet) =>
      resultFunc({ orderSet, assetName, walletAccount })
    )
  )

export default createAssetSourceIncomingOrdersSelectorCreator
