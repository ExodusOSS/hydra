const createRestoreProgressApi = ({ restoreProgressTracker }) => ({
  restoreProgressTracker: {
    restoreAsset: restoreProgressTracker.restoreAsset,
  },
})

const restoreProgressApiDefinition = {
  id: 'restoreProgressTrackerApi',
  type: 'api',
  factory: createRestoreProgressApi,
  dependencies: ['restoreProgressTracker'],
}

export default restoreProgressApiDefinition
