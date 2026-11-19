import { createInMemoryAtom, createStorageAtomFactory } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { createFeatureControl } from '@exodus/feature-control'

import { convertConfigToFeatureControlFormat } from '../shared/format-config.js'

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/export-default-named
export default {
  id: 'featureFlagAtoms',
  type: 'atom-collection',
  dependencies: ['storage', 'config'],
  factory: ({ storage, config }) => {
    const normalizedConfig = convertConfigToFeatureControlFormat(config.features)
    const createStorageAtom = createStorageAtomFactory({ storage })

    return mapValues(normalizedConfig, ({ localDefaults, persisted }, key) => {
      const featureControl = createFeatureControl(localDefaults)
      const defaultValue = { isOn: featureControl.getIsOn() }

      return persisted
        ? createStorageAtom({ key, defaultValue, isSoleWriter: true })
        : createInMemoryAtom({ defaultValue })
    })
  },
  public: true,
}
