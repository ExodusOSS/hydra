import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

function selectorFactory(collectionStats) {
  return memoize(
    ({ id, network, collectionName }) => {
      const key = collectionName ? `${network}:${collectionName}` : id

      return createSelector(collectionStats, (collectionStats) => collectionStats[key])
    },
    ({ id, network, collectionName }) => `${id}|${network}|${collectionName}`
  )
}

const createCollectionStatsSelectorDefinition = {
  id: 'createCollectionStats',
  selectorFactory,
  dependencies: [{ selector: 'collectionStats' }],
}

export default createCollectionStatsSelectorDefinition
