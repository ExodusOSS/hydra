/* eslint-disable @exodus/hydra/no-eternal-subscription */

import lodash from 'lodash'
import { createFusionAtom } from '@exodus/fusion-atoms'
import { createStorageAtomFactory } from '@exodus/atoms'

const { isEqual } = lodash

const createSyncableUiConfigAtom = ({ id, atomId, encrypted, defaultValue }) => {
  const factory = ({ fusion, storage }) => {
    const path = encrypted ? `private.${id}` : id

    const localAtom = createStorageAtomFactory({ storage })({ key: id, isSoleWriter: true })
    const fusionAtom = createFusionAtom({ fusion, path })

    // Sync value up to fusion
    localAtom.observe((value) => {
      if (value === undefined) return // Avoid syncing down missing fusion values
      fusionAtom.set((prevValue) => (isEqual(value, prevValue) ? prevValue : value))
    })

    // Sync value down from fusion
    fusionAtom.observe((value) => {
      if (value === undefined) return // Avoid syncing down missing fusion values
      localAtom.set((prevValue) => (isEqual(value, prevValue) ? prevValue : value))
    })

    return localAtom
  }

  return {
    definition: {
      id: atomId,
      type: 'atom',
      factory,
      dependencies: ['fusion', 'storage'],
    },
    storage: { namespace: 'uiConfig' },
    aliases: [
      { implementationId: encrypted ? 'storage' : 'unsafeStorage', interfaceId: 'storage' },
    ],
  }
}

export default createSyncableUiConfigAtom
