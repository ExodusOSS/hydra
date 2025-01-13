import createUiConfigApiDefinition from './api/index.js'
import createUiConfigAtomDefinitions from './atoms/index.js'
import createUiConfigPluginDefinition from './plugin/index.js'
import { getAtomId } from './utils.js'

export { getConfigReduxEvents, getEventReduxMap } from './utils.js'

const createUiConfigFeatureDefinition = ({ config }) => {
  const configValues = Object.values(config).map((v) => ({ ...v, atomId: getAtomId(v.id) }))

  return {
    id: 'uiConfigFeatureDefinition',
    definitions: [
      ...createUiConfigAtomDefinitions({ configValues }),
      createUiConfigApiDefinition({ configValues }),
      createUiConfigPluginDefinition({ configValues }),
    ],
  }
}

export default createUiConfigFeatureDefinition
