import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'

function selectorFactory(collectionStats) {
  return memoize(({ id, network, collectionName }) => {
    const key = collectionName ? `${network}:${collectionName}` : id

    return createSelector(collectionStats, (collectionStats) => collectionStats[key])
  })
}

const createCollectionStatsSelectorDefinition = {
  id: 'createCollectionStats',
  selectorFactory,
  dependencies: [{ selector: 'collectionStats' }],
}

export default createCollectionStatsSelectorDefinition
