import { difference } from '@exodus/basic-utils'
import { difference as atomDifference } from '@exodus/atoms'

const WAIT_FUSION_SYNC_DURATION = 10_000

const rejectAfter = (ms) => {
  let timeout
  const promise = new Promise((_resolve, reject) => {
    timeout = setTimeout(reject, ms)
  })

  return { promise, clear: () => clearTimeout(timeout) }
}

const createTxLogMonitorsPlugin = ({
  txLogMonitors,
  assetsModule,
  walletAccounts,
  enabledAssetsDifferenceAtom,
  logger,
  availableAssetsAtom,
  config = Object.create(null),
  restoringAssetsAtom,
}) => {
  const availableAssetsDifferenceAtom = atomDifference(availableAssetsAtom)
  const allowedStatusList = config.allowedCustomTokensStatusList
  txLogMonitors.on('unknown-tokens', (params) =>
    handleUnknownTokens({
      params,
      assetsModule,
      allowedStatusList,
      logger,
      restoringAssetsAtom,
      txLogMonitors,
    })
  )
  let enabledAssetsDifferenceAtomUnobserve
  let availableAssetsDifferenceAtomUnobserve
  const recentlyAdded = new Set()

  const onUnlock = () => {
    const timeoutPromise = rejectAfter(WAIT_FUSION_SYNC_DURATION)
    Promise.race([walletAccounts.awaitSynced(), timeoutPromise.promise])
      .catch(() => logger.warn('failed to wait wallet accounts'))
      .finally(() => {
        txLogMonitors.start()
        timeoutPromise.clear()
      })
  }

  const onLock = () => {
    // TODO: Non-blocking until monitor stop is optimized to resolve quickly
    txLogMonitors.stop().catch((e) => logger.warn('failed to stop txLogMonitors on Lock', e))
  }

  const onStop = () => {
    enabledAssetsDifferenceAtomUnobserve?.()
    availableAssetsDifferenceAtomUnobserve?.()
    txLogMonitors.stop()
  }

  const onAssetsSynced = () => {
    enabledAssetsDifferenceAtomUnobserve = enabledAssetsDifferenceAtom.observe(
      ({ previous, current }) => {
        if (!previous) return // ignore first enabled assets value set. monitor.start() should handle these assets

        const assets = assetsModule.getAssets()
        const newlyEnabledAssets = difference(Object.keys(current), Object.keys(previous))
        const toRefresh = newlyEnabledAssets
          .map((assetName) => assets[assetName])
          .filter((asset) => {
            const isRecentlyAdded = recentlyAdded.has(asset.name)
            recentlyAdded.delete(asset.name)
            return !isRecentlyAdded
          })
        const baseAssetNames = [
          ...new Set(toRefresh.map((asset) => asset?.baseAsset?.name).filter(Boolean)),
        ]

        baseAssetNames.forEach((baseAssetName) =>
          txLogMonitors.update({ assetName: baseAssetName })
        )
      }
    )
  }

  const onStart = () => {
    availableAssetsDifferenceAtomUnobserve = availableAssetsDifferenceAtom.observe(
      ({ previous, current = [] }) => {
        if (!previous) return // ignore, it's the first set with imported assets.
        const prevAssetNamesSet = new Set(previous.map((a) => a.assetName))
        const newAssets = current.filter((a) => !prevAssetNamesSet.has(a.assetName))
        const addedAssetNames = newAssets
          .filter((a) => a.reason === 'assets-add' || a.reason === 'assets-update')
          .map((a) => a.assetName)
        const assets = assetsModule.getAssets()
        const baseAssetNames = [
          ...new Set(
            addedAssetNames
              .map((assetName) => {
                const asset = assets[assetName]
                recentlyAdded.add(asset.name)
                return asset?.baseAsset?.name
              })
              .filter(Boolean)
          ),
        ]
        baseAssetNames.forEach((baseAssetName) =>
          txLogMonitors.update({ assetName: baseAssetName, refresh: true })
        )
      }
    )
  }

  return { onUnlock, onAssetsSynced, onLock, onStop, onStart }
}

const txLogMonitorsPlugin = {
  id: 'txLogMonitorsPlugin',
  type: 'plugin',
  factory: createTxLogMonitorsPlugin,
  dependencies: [
    'txLogMonitors',
    'assetsModule',
    'walletAccounts',
    'enabledAssetsDifferenceAtom',
    'logger',
    'availableAssetsAtom',
    'config?',
    'restoringAssetsAtom',
  ],
  public: true,
}

async function handleUnknownTokens({
  params,
  assetsModule,
  allowedStatusList,
  logger,
  restoringAssetsAtom,
  txLogMonitors,
}) {
  let added
  try {
    added = await assetsModule.addTokens(
      allowedStatusList ? { ...params, allowedStatusList } : params
    )
  } catch (error) {
    logger.warn('error adding custom tokens:', error)
  } finally {
    const { baseAssetName } = params
    const restoringAssets = await restoringAssetsAtom.get()
    if (restoringAssets[baseAssetName] && added?.length === 0) {
      txLogMonitors.update({
        highPriority: true,
        assetName: baseAssetName,
      })
    }
  }
}

export default txLogMonitorsPlugin
