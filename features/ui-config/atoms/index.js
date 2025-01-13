import createSyncableUiConfigAtom from './syncable.js'
import createLocalUiConfigAtom from './local.js'

const createUiConfigAtomDefinitions = ({ configValues }) => {
  return configValues.map((configValue) =>
    configValue.syncable
      ? createSyncableUiConfigAtom(configValue)
      : createLocalUiConfigAtom(configValue)
  )
}

export default createUiConfigAtomDefinitions
