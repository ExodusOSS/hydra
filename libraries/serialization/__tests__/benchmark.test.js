import NumberUnit, { UnitType } from '@exodus/currency'
import { Benchmark } from 'benchmark-meter'
import createSerializeDeserialize from '../src/index.js'
import {
  AccountState,
  FiatOrderSet,
  OrderSet,
  PersonalNoteSet,
  Tx,
  TxSet,
  UtxoCollection,
} from '@exodus/models'
import lodash from 'lodash'
import { SERIALIZED_EVENTS } from './fixture/events.js'

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
    type: 'personalnoteset',
    test: (v) => v instanceof PersonalNoteSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => PersonalNoteSet.fromArray(v),
  },
  {
    type: 'utxocollection',
    test: (v) => v instanceof UtxoCollection,
    serialize: (v) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency) }),
    deserialize: (v) => UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
  },
  {
    type: 'txset',
    test: (v) => v instanceof TxSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => TxSet.fromArray(v),
  },
  {
    type: 'tx',
    test: (v) => v instanceof Tx,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => Tx.fromJSON(v),
  },
  {
    type: 'accountstate',
    test: (v) => v instanceof AccountState,
    serialize: (v) => v.toJSON({ includeMem: true }),
    deserialize: (v) => deserialize(v),
  },

  {
    type: 'orderset',
    test: (v) => v instanceof OrderSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => OrderSet.fromArray(v),
  },
  {
    type: 'fiatorderset',
    test: (v) => v instanceof FiatOrderSet,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => FiatOrderSet.fromArray(v),
  },
]

const serializer = createSerializeDeserialize(typeDefinitions)

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

describe('performance', () => {
  const deserializedEvents = SERIALIZED_EVENTS.map((it) => deserialize(it))

  test('serialize', async () => {
    const benchmark = new Benchmark({ repeat: 250 })

    benchmark.add('serialize everything', () => {
      deserializedEvents.forEach((event) => serialize(event))
    })

    const results = await benchmark.run()
    const [result] = results.get()

    console.log(result)
  })

  test('deserialize', async () => {
    const benchmark = new Benchmark({ repeat: 250 })

    benchmark.add('deserialize everything', () => {
      SERIALIZED_EVENTS.forEach((event) => deserialize(event))
    })

    const results = await benchmark.run()
    const [result] = results.get()

    console.log(result)
  })
})
