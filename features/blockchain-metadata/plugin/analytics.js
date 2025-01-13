import ms from 'ms'
import { flattenToPaths } from '@exodus/basic-utils'

const DAYS_90 = ms('90d')

const isTxWithinInterval = ({ date, interval }) => Math.abs(date - Date.now()) < interval

const createBlockchainAnalyticsPlugin = ({ analytics, txLogsAtom }) => {
  let unsubscribe

  const onStart = () => {
    analytics.requireDefaultEventProperties(['assetSentLast90', 'assetReceivedLast90'])

    unsubscribe = txLogsAtom.observe(({ value: txLogByAssetSource }) => {
      let assetSentLast90 = false
      let assetReceivedLast90 = false

      for (const paths of flattenToPaths(txLogByAssetSource)) {
        if (assetSentLast90 && assetReceivedLast90) break

        const txSet = paths.pop()

        for (let i = txSet.size - 1; i >= 0; i--) {
          const tx = txSet.getAt(i)
          const isRecent = isTxWithinInterval({ date: tx.date, interval: DAYS_90 })

          // txlogs sorted by asc date. if tx isn't recent, next ones won't be either
          if (!isRecent) break

          assetSentLast90 = assetSentLast90 || tx.sent
          assetReceivedLast90 = assetReceivedLast90 || tx.received

          if (assetSentLast90 && assetReceivedLast90) break
        }
      }

      analytics.setDefaultEventProperties({ assetSentLast90, assetReceivedLast90 })
    })
  }

  const onStop = () => unsubscribe()

  return { onStart, onStop }
}

export default createBlockchainAnalyticsPlugin
