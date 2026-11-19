import { flattenToPaths } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type { Unsubscribe } from '@exodus/atoms'
import type { EarliestTxDateAtom, Logger, TxLogMap, TxLogsAtom, TxSet } from '../types.js'

const { debounce, minBy } = lodash

const getEarliestTxDate = (txLogsByAssetSource: TxLogMap) =>
  minBy(
    Object.values(txLogsByAssetSource)
      .flatMap((txLogsByAssetName) => Object.values(txLogsByAssetName))
      .filter((txLog) => txLog.size)
      .map((txLog) => txLog.getAt(0)!.date),
    (date) => date.getTime()
  )

const createSyncEarliestTxDatePlugin = ({
  logger,
  earliestTxDateAtom,
  txLogsAtom,
}: {
  logger: Logger
  earliestTxDateAtom: EarliestTxDateAtom
  txLogsAtom: TxLogsAtom
}) => {
  let unsubscribe: Unsubscribe | undefined
  const onAssetsSynced = async () => {
    unsubscribe = txLogsAtom.observe(({ changes }: { changes?: TxLogMap }) => {
      if (changes) {
        // allow: cast; flattenToPaths is dynamically typed
        ;(flattenToPaths(changes) as [string, string, TxSet][]).forEach(
          ([walletAccount, assetName, txLog]) => onTxLog({ walletAccount, assetName, txLog })
        )
      }
    })

    void txLogsAtom.get().then(({ value }) => {
      const earliestTxDate = getEarliestTxDate(value)
      if (earliestTxDate) void maybeUpdateEarliestTxDate(earliestTxDate)
    })
  }

  const maybeUpdateEarliestTxDate = async (date: Date) => {
    const currentEarliestDateString = await earliestTxDateAtom.get()
    if (currentEarliestDateString) {
      const currentEarliestDate = new Date(currentEarliestDateString)
      if (date >= currentEarliestDate) return
    }

    // YYYY-MM-DD
    const dateTruncatedToDay = date.toISOString().slice(0, 10)
    await setEarliestTxDate(dateTruncatedToDay)
  }

  const onTxLog = async ({ txLog }: { walletAccount: string; assetName: string; txLog: TxSet }) => {
    if (txLog.size > 0) {
      await maybeUpdateEarliestTxDate(txLog.getAt(0)!.date)
    }
  }

  const setEarliestTxDate = debounce(async (isoDate: string) => {
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
