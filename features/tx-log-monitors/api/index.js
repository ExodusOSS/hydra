const createTxLogMonitorsApi = ({ txLogMonitors, restoreAssetsTracker }) => ({
  txLogMonitors: {
    update: txLogMonitors.update,
  },
  restoreProgressTracker: {
    restoreAsset: restoreAssetsTracker.restoreAsset,
  },
})

const txLogMonitorsApiDefinition = {
  id: 'txLogMonitorsApi',
  type: 'api',
  factory: createTxLogMonitorsApi,
  dependencies: ['txLogMonitors', 'restoreAssetsTracker'],
}

export default txLogMonitorsApiDefinition
