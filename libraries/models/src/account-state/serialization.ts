import lodash from 'lodash'
import NumberUnit, { UnitType } from '@exodus/currency'
import type { UtxoCollectionJson } from '../utxo-collection/index.js'
import UtxoCollection from '../utxo-collection/index.js'
import createSerializeDeserialize from '@exodus/serialization'

const { mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const unitTypeToJSON = (ut: UnitType) => mapValues(ut.units, (u) => u.power)

const typeDefinitions = [
  {
    type: 'numberunit',
    test: (v: unknown) => v instanceof NumberUnit,
    // @ts-expect-error -- toString without any arguments should not be used
    serialize: (v: NumberUnit) => ({ v: v.toString(), u: unitTypeToJSON(v.unitType) }),
    deserialize: (v: { v: string; u: Record<string, number> }) => UnitType.create(v.u).parse(v.v),
  },
  {
    type: 'utxocollection',
    test: (v: unknown) => v instanceof UtxoCollection,
    serialize: (v: UtxoCollection) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency!) }),
    deserialize: (v: { v: UtxoCollectionJson; u: Record<string, number> }) =>
      UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
  },
]

export const { serialize, deserialize } = createSerializeDeserialize(typeDefinitions)
