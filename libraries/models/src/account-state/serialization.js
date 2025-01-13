import lodash from 'lodash'
import NumberUnit, { UnitType } from '@exodus/currency'
import UtxoCollection from '../utxo-collection/index.js'
import createSerializeDeserialize from '@exodus/serialization'

const { mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const unitTypeToJSON = (ut) => mapValues(ut.units, (u) => u.power)

const typeDefinitions = [
  {
    type: 'numberunit',
    test: (v) => v instanceof NumberUnit,
    serialize: (v) => ({ v: v.toString(), u: unitTypeToJSON(v.unitType) }),
    deserialize: (v) => UnitType.create(v.u).parse(v.v),
  },
  {
    type: 'utxocollection',
    test: (v) => v instanceof UtxoCollection,
    serialize: (v) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency) }),
    deserialize: (v) => UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
  },
]

export const { serialize, deserialize } = createSerializeDeserialize(typeDefinitions)
