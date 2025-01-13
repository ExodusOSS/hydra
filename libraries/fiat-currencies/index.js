import lodash from 'lodash'
import { UnitType } from '@exodus/currency'
import units from './units.js'

export { default as units } from './units.js'
export * from './units.js'

// eslint-disable-next-line @exodus/basic-utils/prefer-basic-utils
export default lodash.mapValues(units, (unit, key) => {
  // we do not display cents or other baseUnit right now
  // so `microcents` is ok
  return UnitType.create({ microcents: 0, cents: 6, [key]: 8 })
})
