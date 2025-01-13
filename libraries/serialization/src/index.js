import lodash from 'lodash'

const { isArray, isObject, mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const UNDEF = { t: 'undef' }

export default function createSerializeDeserialize(userTypes = []) {
  const typeDefinitions = [
    ...userTypes,
    {
      type: 'date',
      test: (v) => v instanceof Date,
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new Date(v),
    },
    {
      type: 'buffer',
      test: (v) => v instanceof Buffer,
      serialize: (v) => v.toString('base64'),
      deserialize: (v) => Buffer.from(v, 'base64'),
    },
    {
      type: 'uint8array',
      test: (v) => v instanceof Uint8Array,
      serialize: (v) => Buffer.from(v).toString('base64'),
      deserialize: (v) => {
        const buf = Buffer.from(v, 'base64')
        const arr = new Uint8Array(buf.length)
        arr.set(buf)
        return arr
      },
    },
    {
      type: 'bigint',
      test: (v) => typeof v === 'bigint',
      serialize: (v) => v.toString(),
      deserialize: BigInt,
    },
    {
      type: 'array',
      test: isArray,
      serialize: (v) => v.map((o) => (o === undefined ? UNDEF : serialize(o))),
      deserialize: (v) => v.map((o) => (o?.t === UNDEF.t ? undefined : deserialize(o))),
    },
    {
      type: 'object',
      test: isObject,
      serialize: (v) => mapValues(v, (o) => serialize(o)),
      deserialize: (v) => mapValues(v, (o) => deserialize(o)),
    },
  ]

  const typeNames = new Set(typeDefinitions.map((def) => def.type))

  const serialize = (value) => {
    const typeDef = typeDefinitions.find((def) => def.test(value))
    return typeDef ? { t: typeDef.type, v: typeDef.serialize(value) } : value
  }

  const deserialize = (value) =>
    isObject(value) && Object.keys(value).length === 2 && 'v' in value && typeNames.has(value.t)
      ? typeDefinitions.find((def) => def.type === value.t).deserialize(value.v)
      : value

  return { serialize, deserialize }
}
