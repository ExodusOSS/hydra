import { memoize } from '@exodus/basic-utils'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

import type { State } from '../initial-state.js'

type DataSelector = (state: { remoteConfig: State }) => State['data']

const selectorFactory = (dataSelector: DataSelector) =>
  memoize((path: string) => createSelector(dataSelector, (data) => lodash.get(data, path)))

const getSelectorDefinition = defineSelectorFactory({
  id: 'get',
  selectorFactory,
  dependencies: [{ selector: 'data' }],
})

export default getSelectorDefinition
