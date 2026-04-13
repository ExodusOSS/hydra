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
  WalletAccount,
} from '@exodus/models'
import createSerializeDeserialize from '@exodus/serialization'
import KeyIdentifier from '@exodus/key-identifier'
import BN from 'bn.js'

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
      test: (v) => isNumberUnit(v), // TODO: switch to 'class' for just using instanceof
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
    {
      type: 'keyidentifier',
      test: (v) => v && typeof v === 'object' && v[Symbol.toStringTag] === 'KeyIdentifier',
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new KeyIdentifier(v),
    },
    {
      type: 'walletaccount',
      class: WalletAccount,
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new WalletAccount(v),
    },
    {
      type: 'bn.js',
      // Workaround for BN.isBN() not properly checking the existence of `v.constructor`
      test: (v) => v && v.constructor && !Object.hasOwn(v, 'constructor') && BN.isBN(v),
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new BN(v, 16),
    },
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
  const { serialize, deserialize } = createSerializeDeserialize({
    typeDefinitions: userTypes,
    skipUndefinedProperties: true,
    unknownClassesAsObjects: true, // TODO: flip to false in major
    unknownNonObjectsPassthrough: true, // TODO: flip to false in major
  })
  return { serialize, deserialize }
}
