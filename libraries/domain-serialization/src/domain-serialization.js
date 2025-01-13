import { mapValues } from '@exodus/basic-utils'
import { isNumberUnit, UnitType } from '@exodus/currency'
import {
  AccountState,
  FiatOrderSet,
  OrderSet,
  PersonalNoteSet,
  Tx,
  TxSet,
  UtxoCollection,
} from '@exodus/models'
import createSerializeDeserialize from '@exodus/serialization'
import KeyIdentifier from '@exodus/key-identifier'

/**
 * Create serialization functions for a wide range of domain and native objects
 * @returns {{serialize: (payload: object) => string, deserialize: (payload: string) => object}}
 */
export const createBasicDomainSerialization = (
  { extraTypeDefinitions = [], excludeSerialization = Object.create(null) } = Object.create(null)
) => {
  const unitTypeToJSON = (ut) => mapValues(ut.units, (u) => u.power)

  const typeDefinitions = [
    {
      type: 'numberunit',
      test: (v) => isNumberUnit(v),
      serialize: (v) => ({ v: v.toString(), u: unitTypeToJSON(v.unitType) }),
      deserialize: (v) => UnitType.create(v.u).parse(v.v),
    },
    {
      type: 'personalnoteset',
      test: (v) => PersonalNoteSet.isInstance(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => PersonalNoteSet.fromArray(v),
    },
    {
      type: 'utxocollection',
      test: (v) => UtxoCollection.isInstance(v),
      serialize: (v) => ({ v: v.toJSON(), u: unitTypeToJSON(v.currency) }),
      deserialize: (v) => UtxoCollection.fromJSON(v.v, { currency: UnitType.create(v.u) }),
    },
    {
      type: 'txset',
      test: (v) => TxSet.isInstance(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => TxSet.fromArray(v),
    },
    {
      type: 'tx',
      test: (v) => Tx.isInstance(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => Tx.fromJSON(v),
    },
    {
      type: 'accountstate',
      test: (v) => AccountState.isInstance(v),
      serialize: (v) => v.toJSON({ includeMem: true }),
      deserialize: (v) => deserialize(v),
    },

    {
      type: 'orderset',
      test: (v) => OrderSet.isInstance(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => OrderSet.fromArray(v),
    },
    {
      type: 'fiatorderset',
      test: (v) => FiatOrderSet.isInstance(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => FiatOrderSet.fromArray(v),
    },
    {
      type: 'keyidentifier',
      test: (v) => v && typeof v === 'object' && v[Symbol.toStringTag] === 'KeyIdentifier',
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new KeyIdentifier(v),
    },
    // TODO include bn.js
  ]

  const userTypes = [...typeDefinitions, ...extraTypeDefinitions].map((userType) => {
    if (excludeSerialization[userType.type]) {
      return {
        ...userType,
        serialize: () => {
          throw new Error(`${userType.type} cannot be serialized`)
        },
      }
    }

    return userType
  })
  const { serialize, deserialize } = createSerializeDeserialize(userTypes)
  return { serialize, deserialize }
}
