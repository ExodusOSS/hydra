import { createAtomObserver } from '@exodus/atoms'
import pDefer from 'p-defer'

const createRestoreAssetsPlugin = ({
  restoreProgressTracker,
  port,
  restoringAssetsAtom,
  txLogMonitors,
}) => {
  let restoreDefer = pDefer()
  let restoreSeedDefer

  // This is intended to block the thread for onRestore listeners until the restore process has finished
  const onRestore = async () => restoreDefer.promise

  const restoreAllThenResolve = (deferred) => {
    restoreProgressTracker.on('restored', () => {
      return deferred.resolve()
    })
    restoreProgressTracker.restoreAll()
  }

  let startedTracking = false
  const startTrackingRestore = () => {
    if (startedTracking) return
    startedTracking = true
    restoreAllThenResolve(restoreDefer)
  }

  const restoringAssetsAtomObserver = createAtomObserver({
    port,
    atom: restoringAssetsAtom,
    event: 'restoringAssets',
  })
  restoringAssetsAtomObserver.register()

  const onStart = ({ isRestoring }) => {
    if (isRestoring) {
      startTrackingRestore()
    } else {
      restoreDefer.resolve()
    }
  }

  const onLoad = () => {
    restoringAssetsAtomObserver.start()
  }

  const onImport = () => {
    restoreDefer = pDefer()
    startTrackingRestore()
  }

  const onRestoreSeed = async () => {
    restoreSeedDefer = pDefer()

    restoreAllThenResolve(restoreSeedDefer)
    txLogMonitors.updateAll()

    // Blocks the execution for onRestoreSeed listeners until the restore process has finished
    return restoreSeedDefer.promise
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
  dependencies: ['restoreProgressTracker', 'port', 'restoringAssetsAtom', 'txLogMonitors'],
  public: true,
}

export default restoreAssetsPluginDefinition
