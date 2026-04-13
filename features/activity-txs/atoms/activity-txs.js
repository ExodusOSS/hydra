import { combine, compute } from '@exodus/atoms'
import { createSelector } from 'reselect'
import { createDeepEqualOutputSelector } from '@exodus/core-selectors/utils/deep-equal.js'
import { memoize } from '@exodus/basic-utils'

const createAssetSourceActivityTxsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createDeepEqualOutputSelector(
      (args) => args.txs,
      (args) => args.activityOptions,
      (args) => args.asset,
      (txs, activityOptions, asset) =>
        asset.api.getActivityTxs({
          txs,
          asset,
          options: activityOptions,
        })
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const createAssetSourceActivityOptionsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createDeepEqualOutputSelector(
      (args) => args.accountState,
      (args) => args.asset,
      (accountState, asset) =>
        asset.api.getActivityOptions({
          accountState,
        })
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const createAssetSourceTxsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createSelector(
      (args) => args.txSet,
      (txSet) => {
        return [...txSet]
      }
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const createActivityTxsAtom = ({
  txLogsAtom,
  accountStatesAtom,
  assetsModule,
  logger,
  errorTracking,
}) => {
  const inputAtom = combine({
    txLogs: txLogsAtom,
    accountStates: accountStatesAtom,
  })

  let prevResult = Object.create(null)
  const perAssetCache = new Map()
  let cacheEntriesCount = 0
  let runIdCounter = 0

  const getWalletCache = (walletAccount) => {
    let walletCache = perAssetCache.get(walletAccount)
    if (!walletCache) {
      walletCache = new Map()
      perAssetCache.set(walletAccount, walletCache)
    }

    return walletCache
  }

  function processActivityForAsset(
    walletAccount,
    assetName,
    assetTxSet,
    accountStatesValue,
    runId
  ) {
    const walletCache = getWalletCache(walletAccount)
    const cached = walletCache.get(assetName)
    const asset = assetsModule.getAsset(assetName)
    const baseAssetName = asset.baseAsset.name
    const baseAssetAccountState = accountStatesValue?.[walletAccount]?.[baseAssetName]

    if (
      cached &&
      cached.txSet === assetTxSet &&
      cached.baseAssetAccountState === baseAssetAccountState
    ) {
      cached.lastSeen = runId
      return cached.output
    }

    const txs =
      cached && cached.txSet === assetTxSet
        ? cached.txs
        : createAssetSourceTxsSelector({ assetName, walletAccount })({ txSet: assetTxSet })

    if (asset?.api?.getActivityTxs) {
      let activityOptions
      if (asset?.api?.getActivityOptions) {
        activityOptions =
          cached &&
          cached.baseAssetAccountState === baseAssetAccountState &&
          cached.baseAssetName === baseAssetName
            ? cached.activityOptions
            : createAssetSourceActivityOptionsSelector({ assetName, walletAccount })({
                accountState: baseAssetAccountState,
                asset,
              })
      }

      const getActivityForAssetSource = createAssetSourceActivityTxsSelector({
        assetName,
        walletAccount,
      })

      try {
        const activityTxs = getActivityForAssetSource({
          asset,
          txs,
          activityOptions,
        })

        if (!cached) cacheEntriesCount += 1
        walletCache.set(assetName, {
          baseAssetName,
          baseAssetAccountState,
          txSet: assetTxSet,
          txs,
          activityOptions,
          output: activityTxs,
          lastSeen: runId,
        })

        return activityTxs
      } catch (e) {
        errorTracking?.track({
          error: e,
          context: { assetName },
        })
        logger?.warn?.(`failed to get activity txs for asset: ${assetName}`, e)

        if (!cached) cacheEntriesCount += 1
        walletCache.set(assetName, {
          baseAssetName,
          baseAssetAccountState,
          txSet: assetTxSet,
          txs,
          activityOptions,
          output: [],
          lastSeen: runId,
        })

        return []
      }
    }

    if (!cached) cacheEntriesCount += 1
    walletCache.set(assetName, {
      baseAssetName,
      baseAssetAccountState,
      txSet: assetTxSet,
      txs,
      activityOptions: undefined,
      output: txs,
      lastSeen: runId,
    })

    return txs
  }

  const selector = ({ txLogs, accountStates }) => {
    const runId = (runIdCounter += 1)
    const txLogsValue = txLogs?.value ?? Object.create(null)
    const accountStatesValue = accountStates?.value ?? Object.create(null)

    let activeCount = 0

    const nextResult = Object.create(null)
    let reusedAllWalletObjects = true
    let walletCount = 0
    let prevWalletCount = 0

    for (const prevWalletAccount in prevResult) {
      if (Object.prototype.hasOwnProperty.call(prevResult, prevWalletAccount)) prevWalletCount += 1
    }

    for (const walletAccount in txLogsValue) {
      if (!Object.prototype.hasOwnProperty.call(txLogsValue, walletAccount)) continue
      walletCount += 1

      const accountTxLogs = txLogsValue[walletAccount] ?? Object.create(null)
      const prevWallet = prevResult[walletAccount]

      let canReuseWallet = Boolean(prevWallet)
      let assetsCount = 0

      if (prevWallet) {
        for (const assetName in accountTxLogs) {
          if (!Object.prototype.hasOwnProperty.call(accountTxLogs, assetName)) continue
          assetsCount += 1
          activeCount += 1

          const activityTxs = processActivityForAsset(
            walletAccount,
            assetName,
            accountTxLogs[assetName],
            accountStatesValue,
            runId
          )

          if (prevWallet[assetName] !== activityTxs) {
            canReuseWallet = false
            break
          }
        }

        if (canReuseWallet) {
          let prevWalletAssetsCount = 0
          for (const assetName in prevWallet) {
            if (Object.prototype.hasOwnProperty.call(prevWallet, assetName)) {
              prevWalletAssetsCount += 1
            }
          }

          if (prevWalletAssetsCount === assetsCount) {
            nextResult[walletAccount] = prevWallet
            continue
          }

          canReuseWallet = false
        }
      }

      const nextWallet = Object.create(null)
      for (const assetName in accountTxLogs) {
        if (!Object.prototype.hasOwnProperty.call(accountTxLogs, assetName)) continue
        activeCount += 1

        const activityTxs = processActivityForAsset(
          walletAccount,
          assetName,
          accountTxLogs[assetName],
          accountStatesValue,
          runId
        )
        nextWallet[assetName] = activityTxs
      }

      nextResult[walletAccount] = nextWallet
      reusedAllWalletObjects = false
    }

    if (reusedAllWalletObjects && walletCount === prevWalletCount) {
      return prevResult
    }

    if (activeCount > 0 && cacheEntriesCount > activeCount * 2) {
      for (const [walletAccount, walletCache] of perAssetCache) {
        for (const [assetName, cached] of walletCache) {
          if (cached.lastSeen !== runId) {
            walletCache.delete(assetName)
            cacheEntriesCount -= 1
          }
        }

        if (walletCache.size === 0) {
          perAssetCache.delete(walletAccount)
        }
      }
    }

    prevResult = nextResult

    return nextResult
  }

  return compute({
    atom: inputAtom,
    selector,
  })
}

const activityTxsAtomDefinition = {
  id: 'activityTxsAtom',
  type: 'atom',
  factory: createActivityTxsAtom,
  dependencies: ['txLogsAtom', 'accountStatesAtom', 'assetsModule', 'logger', 'errorTracking'],
  public: true,
}

export default activityTxsAtomDefinition
