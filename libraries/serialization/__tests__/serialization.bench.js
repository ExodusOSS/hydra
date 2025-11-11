import { test } from 'node:test'

import NumberUnit, { UnitType } from '@exodus/currency'
import {
  AccountState,
  FiatOrderSet,
  OrderSet,
  PersonalNoteSet,
  Tx,
  TxSet,
  UtxoCollection,
} from '@exodus/models'
import { benchmark } from '@exodus/test/benchmark' // eslint-disable-line import/no-unresolved

import createSerializeDeserialize from '../src/index.js'
import { SERIALIZED_EVENTS } from './fixture/events.js'

const mapValues = (o, f) => Object.fromEntries(Object.keys(o).map((k) => [k, f(o[k])]))

const unitTypeToJSON = (ut) => mapValues(ut.units, (u) => u.power)
const typeDefinitions = [
  {
    type: 'numberunit',
    class: NumberUnit,
    serialize: (v) => ({ v: v.toString(), u: unitTypeToJSON(v.unitType) }),
    deserialize: (v) => UnitType.create(v.u).parse(v.v),
  },
  {
    type: 'personalnoteset',
    class: PersonalNoteSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => PersonalNoteSet.fromArray(v),
  },
  {
    type: 'utxocollection',
    class: UtxoCollection,
    serialize: (v) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency) }),
    deserialize: (v) => UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
  },
  {
    type: 'txset',
    class: TxSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => TxSet.fromArray(v),
  },
  {
    type: 'tx',
    class: Tx,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => Tx.fromJSON(v),
  },
  {
    type: 'accountstate',
    class: AccountState,
    serialize: (v) => v.toJSON({ includeMem: true }),
    deserialize: (v) => deserialize(v),
  },

  {
    type: 'orderset',
    class: OrderSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => OrderSet.fromArray(v),
  },
  {
    type: 'fiatorderset',
    class: FiatOrderSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => FiatOrderSet.fromArray(v),
  },
]

const serializer = createSerializeDeserialize({ typeDefinitions })

const serialize = (arg) => {
  try {
    return JSON.stringify(serializer.serialize(arg))
  } catch (e) {
    console.error(`Cannot serialize: ${e.message}`, arg, e)
    throw e
  }
}

const deserialize = (arg) => {
  try {
    return serializer.deserialize(typeof arg === 'string' ? JSON.parse(arg) : arg)
  } catch (e) {
    console.error(`Cannot deserialize: ${e.message}`, arg, e)
    throw e
  }
}

test('performance', async () => {
  const deserializedEvents = SERIALIZED_EVENTS.map((it) => deserialize(it))

  await benchmark('serialize everything', () => {
    deserializedEvents.forEach((event) => serialize(event))
  })

  await benchmark('deserialize everything', () => {
    SERIALIZED_EVENTS.forEach((event) => deserialize(event))
  })
})
