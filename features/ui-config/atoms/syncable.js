import { createFusionAtom } from '@exodus/fusion-atoms'

const createSyncableAtom = ({ id, atomId, encrypted }) => {
  const factory = ({ fusion }) => {
    const path = encrypted ? `private.${id}` : id
    return createFusionAtom({ fusion, path })
  }

  return {
    definition: {
      id: `syncable${atomId}`,
      type: 'atom',
      factory,
      dependencies: ['fusion'],
    },
  }
}

export default createSyncableAtom
