import { flattenToPaths } from '@exodus/basic-utils'
import lodash from 'lodash'

const { debounce, minBy } = lodash

const getEarliestTxDate = (txLogsByAssetSource) =>
  minBy(
    Object.values(txLogsByAssetSource)
      .flatMap((txLogsByAssetName) => Object.values(txLogsByAssetName))
      .filter((txLog) => txLog.size)
      .map((txLog) => txLog.getAt(0).date),
    (date) => date.getTime()
  )

const createSyncEarliestTxDatePlugin = ({ logger, earliestTxDateAtom, txLogsAtom }) => {
  let unsubscribe
  const onAssetsSynced = async () => {
    unsubscribe = txLogsAtom.observe(({ changes }) => {
      if (changes) {
        flattenToPaths(changes).forEach(([walletAccount, assetName, txLog]) =>
          onTxLog({ walletAccount, assetName, txLog })
        )
      }
    })

    txLogsAtom.get().then(({ value }) => {
      const earliestTxDate = getEarliestTxDate(value)
      if (earliestTxDate) maybeUpdateEarliestTxDate(earliestTxDate)
    })
  }

  const maybeUpdateEarliestTxDate = async (date) => {
    const currentEarliestDateString = await earliestTxDateAtom.get()
    if (currentEarliestDateString) {
      const currentEarliestDate = new Date(currentEarliestDateString)
      if (date >= currentEarliestDate) return
    }

    // YYYY-MM-DD
    const dateTruncatedToDay = date.toISOString().slice(0, 10)
    await setEarliestTxDate(dateTruncatedToDay)
  }

  const onTxLog = async ({ txLog }) => {
    if (txLog.size > 0) {
      await maybeUpdateEarliestTxDate(txLog.getAt(0).date)
    }
  }

  const setEarliestTxDate = debounce(async (isoDate) => {
    logger.debug('syncing up earliest tx date', isoDate)
    await earliestTxDateAtom.set(isoDate)
  }, 1000)

  return {
    onAssetsSynced,
    onStop: () => {
      if (unsubscribe) unsubscribe()
      setEarliestTxDate.cancel()
    },
  }
}

export default createSyncEarliestTxDatePlugin
