import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
import { formatNftTx, formatUnindexedNftTx } from '../utils/activity-formatters/format-nft.js'

const selectorFactory =
  (createAssetSourceNftTxsById, activeNftsSelector, assetsSelector) =>
  ({ createActivitySelector, nftsNetworkNameToAssetName }) => {
    assert(createActivitySelector, 'please provide activitySelector')
    assert(nftsNetworkNameToAssetName, 'please provide nftsNetworkNameToAssetName')

    return memoize(
      ({ assetName, walletAccount, ...rest }) => {
        const activitySelector = createActivitySelector({ assetName, walletAccount, ...rest })
        if (createAssetSourceNftTxsById.isFallback || activeNftsSelector.isFallback) {
          return activitySelector
        }

        const nftsSelector = createAssetSourceNftTxsById({ assetName, walletAccount })
        assert(nftsSelector, 'nfts redux feature must be installed to use this selector')
        return createSelector(
          nftsSelector,
          activeNftsSelector,
          assetsSelector,
          activitySelector,
          (nftsByTxId, activeNfts, assets, activity) => {
            const spamNftIdsSet = new Set(
              Object.values(activeNfts)
                .flat()
                .filter((nft) => nft.isSpam)
                .map(({ id }) => id && id.toLowerCase())
            )

            const indexedNftTxIds = new Set()
            const resultActivity = []
            let hasChanges = false
            for (const activityItem of activity) {
              const nft = nftsByTxId.get(activityItem.txId)

              if (nft && activityItem.tx) {
                const nftIdLower = nft.nftId && nft.nftId.toLowerCase()
                if (!nftIdLower || !spamNftIdsSet.has(nftIdLower)) {
                  hasChanges = true
                  indexedNftTxIds.add(nft.txId)
                  resultActivity.push(
                    formatNftTx({
                      ...activityItem,
                      nft,
                      asset: assets[activityItem.assetName],
                      assetName: activityItem.assetName,
                    })
                  )
                }
              } else {
                resultActivity.push(activityItem)
              }
            }

            ;[...nftsByTxId.values()]
              .filter((nftTx) => {
                const nftIdLower = nftTx.nftId && nftTx.nftId.toLowerCase()
                return (
                  Object.hasOwn(nftsNetworkNameToAssetName, nftTx.network) &&
                  assetName === nftsNetworkNameToAssetName[nftTx.network] &&
                  !indexedNftTxIds.has(nftTx.txId) &&
                  (!nftIdLower || !spamNftIdsSet.has(nftIdLower))
                )
              })
              .forEach((nftTx) => {
                hasChanges = true
                const assetName = nftsNetworkNameToAssetName[nftTx.network]
                const asset = assets[assetName]
                const formatted = formatUnindexedNftTx({ nftTx, assetName: asset.name })

                resultActivity.push(formatted)
              })

            if (!hasChanges) return activity

            return resultActivity
          }
        )
      },
      ({ assetName, walletAccount, ...rest }) =>
        `${assetName}_${walletAccount}_${JSON.stringify(rest)}`
    )
  }

const createWithNftsActivitySelectorDefinition = {
  id: 'createWithNftsActivity',
  selectorFactory,
  dependencies: [
    { module: 'nfts', selector: 'createAssetSourceNftTxsById', optional: true },
    { module: 'nfts', selector: 'activeNfts', optional: true },
    { module: 'assets', selector: 'all' },
  ],
}

export default createWithNftsActivitySelectorDefinition
