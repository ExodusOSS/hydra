import createSyncableRemoteAtom from './syncable.js'
import createLocalUiConfigAtom from './local.js'

const createUiConfigAtomDefinitions = ({ configValues }) => {
  return configValues.flatMap((configValue) =>
    configValue.syncable
      ? [createLocalUiConfigAtom(configValue), createSyncableRemoteAtom(configValue)]
      : createLocalUiConfigAtom(configValue)
  )
}

export default createUiConfigAtomDefinitions
