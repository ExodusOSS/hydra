import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'

const createBatchedAssetSourceActivityByIdSelector = {
  id: 'createBatchedAssetSourceActivityById',
  dependencies: [{ selector: 'createBatchedAssetSourceSelector' }],
  selectorFactory: (createBatchedAssetSourceSelector) =>
    memoize(
      ({ assetName, walletAccount, limit }) =>
        createSelector(
          createBatchedAssetSourceSelector({ assetName, walletAccount, limit }),
          (transformedTxs) =>
            transformedTxs.reduce((acc, tx) => {
              ;(acc[tx.txId] || (acc[tx.txId] = [])).push(tx)
              return acc
            }, Object.create(null))
        ),
      ({ assetName, walletAccount, limit }) => `${assetName}_${walletAccount}_${limit}`
    ),
}

export default createBatchedAssetSourceActivityByIdSelector
