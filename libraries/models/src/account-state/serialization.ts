// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
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
    class: NumberUnit,
    // @ts-expect-error -- toString without any arguments should not be used
    serialize: (v: NumberUnit) => ({ v: v.toString(), u: unitTypeToJSON(v.unitType) }),
    deserialize: (v: { v: string; u: Record<string, number> }) => UnitType.create(v.u).parse(v.v),
  },
  {
    type: 'utxocollection',
    class: UtxoCollection,
    serialize: (v: UtxoCollection) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency!) }),
    deserialize: (v: { v: UtxoCollectionJson; u: Record<string, number> }) =>
      UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
  },
]

export const { serialize, deserialize } = createSerializeDeserialize({
  typeDefinitions,
  skipUndefinedProperties: true,
  unknownClassesAsObjects: true, // TODO: flip to false in major
  unknownNonObjectsPassthrough: true, // TODO: flip to false in major
})
