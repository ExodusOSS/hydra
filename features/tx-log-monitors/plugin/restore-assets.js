import { createAtomObserver } from '@exodus/atoms'

const createRestoreAssetsPlugin = ({
  port,
  restoreAssetsTracker,
  restoringAssetsAtom,
  config,
  errorTracking,
}) => {
  let restoreSetup
  let restoreWaitCleanup

  const assetNamesToNotWait = new Set(config.assetNamesToNotWait)

  const waitAllAssetsRestored = () =>
    new Promise((resolve) => {
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        restoreWaitCleanup = undefined
        resolve()
      }

      // Monitor restoring assets until there's no more to wait
      const unobserve = restoringAssetsAtom.observe((restoringAssets) => {
        const restoringAssetsToWait = Object.keys(restoringAssets).filter(
          (assetName) => !assetNamesToNotWait.has(assetName)
        )

        if (restoringAssetsToWait.length > 0) return

        unobserve()
        settle()
      })

      restoreWaitCleanup = () => {
        unobserve()
        settle()
      }
    })

  const setupRestore = () => {
    if (!restoreSetup) {
      // on startup monitors runs automatically
      restoreSetup = Promise.resolve(restoreAssetsTracker.restoreAll(false))
    }

    return restoreSetup
  }

  const restoringAssetsAtomObserver = createAtomObserver({
    port,
    atom: restoringAssetsAtom,
    event: 'restoringAssets',
  })
  restoringAssetsAtomObserver.register()

  // This is intended to block the thread for onRestore listeners until the restore process has finished
  const onRestore = async () => {
    await restoreSetup
    await waitAllAssetsRestored()
  }

  const onStart = ({ isRestoring }) => {
    if (isRestoring) {
      setupRestore().catch((e) => errorTracking.track({ error: e }))
    }
  }

  const onLoad = () => {
    restoringAssetsAtomObserver.start()
  }

  const onImport = () => {
    setupRestore().catch((e) => errorTracking.track({ error: e }))
  }

  const onClear = async () => {
    await restoreAssetsTracker.clear()
  }

  const onStop = () => {
    restoreWaitCleanup?.()
    restoreSetup = undefined
    restoringAssetsAtomObserver.unregister()
  }

  return {
    onRestore,
    onStart,
    onLoad,
    onImport,
    onClear,
    onStop,
  }
}

const restoreAssetsPluginDefinition = {
  id: 'restoreAssetsPlugin',
  factory: createRestoreAssetsPlugin,
  type: 'plugin',
  dependencies: ['port', 'restoreAssetsTracker', 'restoringAssetsAtom', 'config', 'errorTracking'],
  public: true,
}

export default restoreAssetsPluginDefinition
