declare const restoreProgressTrackerApiDefinition: {
  id: 'restoreProgressTrackerApi'
  type: 'api'
  factory(): {
    restoreProgressTracker: {
      restoreAsset: (assetName: string) => Promise<void>
    }
  }
}

export default restoreProgressTrackerApiDefinition
