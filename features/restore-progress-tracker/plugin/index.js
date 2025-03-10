import { createAtomObserver } from '@exodus/atoms'
import pDefer from 'p-defer'

const createRestoreAssetsPlugin = ({
  port,
  restoreProgressTracker,
  restoringAssetsAtom,
  config,
  errorTracking,
}) => {
  let restoreDefer

  const assetNamesToNotWait = new Set(config.assetNamesToNotWait)

  // This is intended to block the thread for onRestore listeners until the restore process has finished
  const onRestore = async () => {
    if (restoreDefer) {
      await restoreDefer.promise
    } else {
      throw new Error(
        'unexpected. are you calling onRestore hook before application onStart or onImport hooks?'
      )
    }
  }

  const waitAllAssetsRestored = () =>
    new Promise(async (resolve) => {
      // Monitor restoring assets until there's no more to wait
      const unobserve = restoringAssetsAtom.observe((restoringAssets) => {
        const restoringAssetsToWait = Object.keys(restoringAssets).filter(
          (assetName) => !assetNamesToNotWait.has(assetName)
        )

        if (restoringAssetsToWait.length > 0) return

        resolve()
        unobserve()
      })
    })

  const startTrackingRestore = async () => {
    if (restoreDefer) {
      return // restore tracking in progress
    }

    restoreDefer = pDefer()
    // on startup monitors runs automatically
    await restoreProgressTracker.restoreAll(false)
    await waitAllAssetsRestored()
    restoreDefer.resolve()
  }

  const restoringAssetsAtomObserver = createAtomObserver({
    port,
    atom: restoringAssetsAtom,
    event: 'restoringAssets',
  })
  restoringAssetsAtomObserver.register()

  const onStart = ({ isRestoring }) => {
    if (isRestoring) {
      startTrackingRestore().catch((e) => {
        errorTracking.track({ error: e, namespace: 'restoreAssetsPlugin' })
        restoreDefer?.reject(e)
      })
    }
  }

  const onLoad = () => {
    restoringAssetsAtomObserver.start()
  }

  const onImport = () => {
    startTrackingRestore().catch((e) => {
      errorTracking.track({ error: e, namespace: 'restoreAssetsPlugin' })
      restoreDefer?.reject(e)
    })
  }

  const onRestoreSeed = async () => {
    await restoreProgressTracker.restoreAll(true)
    await waitAllAssetsRestored()
  }

  const onClear = async () => {
    await restoreProgressTracker.clear()
  }

  const onStop = () => {
    restoringAssetsAtomObserver.unregister()
  }

  return {
    onRestore,
    onStart,
    onLoad,
    onImport,
    onClear,
    onStop,
    onRestoreSeed,
  }
}

const restoreAssetsPluginDefinition = {
  id: 'restoreAssetsPlugin',
  factory: createRestoreAssetsPlugin,
  type: 'plugin',
  dependencies: [
    'port',
    'restoreProgressTracker',
    'restoringAssetsAtom',
    'config',
    'errorTracking',
  ],
  public: true,
}

export default restoreAssetsPluginDefinition
