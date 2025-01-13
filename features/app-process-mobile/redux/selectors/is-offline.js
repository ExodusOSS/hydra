const isOfflineSelector = {
  id: 'isOffline',
  resultFunction: (networkType) => networkType === 'none',
  dependencies: [{ selector: 'networkType' }],
}

export default isOfflineSelector
