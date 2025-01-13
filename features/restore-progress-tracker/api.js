const createRestoreProgressApi = ({ restoreProgressTracker }) => ({
  restoreProgressTracker: {
    restoreAsset: restoreProgressTracker.restoreAsset,
  },
})

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'restoreProgressTrackerApi',
  type: 'api',
  factory: createRestoreProgressApi,
  dependencies: ['restoreProgressTracker'],
}
