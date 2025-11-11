import { toBase64, fromBase64 } from '@exodus/bytes/base64.js'

const mapValues = (o, f) => Object.fromEntries(Object.keys(o).map((k) => [k, f(o[k])]))
const isPlainObject = (o) => o && [null, Object.prototype].includes(Object.getPrototypeOf(o))

const { Buffer } = globalThis // not required

export default function createSerializeDeserialize({
  typeDefinitions = [],
  skipUndefinedProperties = false,
  functionsAsObjects = false,
  unknownClassesAsObjects = false,
  unknownNonObjectsPassthrough = false,
} = {}) {
  const demap = new Map(typeDefinitions.map((def) => [def.type, def.deserialize]))

  for (const def of typeDefinitions) {
    if (def.class && def.test) throw new Error('Only one of .class or .test can be specified')
  }

  const classDefitions = typeDefinitions.filter((t) => t.class)
  const testDefinitions = typeDefinitions.filter((t) => t.test)

  const serialize = (v) => {
    if (v === undefined) return { t: 'undef' }

    // Primitives
    if (v === null) return v
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
    if (typeof v === 'bigint') return { t: 'bigint', v: v.toString() }

    // Fast path
    if (v instanceof Date) return { t: 'date', v: v.toJSON() }
    if (v instanceof Uint8Array) {
      return { t: Buffer?.isBuffer(v) ? 'buffer' : 'uint8array', v: toBase64(v) }
    }

    // Fast path: empty object / empty array
    const isPlain = isPlainObject(v)
    if (isPlain && Object.keys(v).length === 0) return { t: 'object', v: {} }
    const isArray = Array.isArray(v)
    if (isArray && v.length === 0) return { t: 'array', v: [] }

    // Custom types, non-classes
    for (const def of testDefinitions) {
      if (def.test(v)) return { t: def.type, v: def.serialize(v) }
    }

    // Some custom types are arrays or plain objects, so this must be below them
    // This is unfortunately bad for perf
    if (isPlain) return { t: 'object', v: mapValues(v, (o) => serializeProp(o)) }
    if (isArray) return { t: 'array', v: v.map((o) => serialize(o)) }

    // Custom types, classes
    for (const def of classDefitions) {
      if (v instanceof def.class) return { t: def.type, v: def.serialize(v) }
    }

    if (functionsAsObjects && typeof v === 'function') {
      return { t: 'object', v: mapValues(v, (o) => serializeProp(o)) }
    }

    if (typeof v === 'object') {
      // Fallback for generic objects
      if (unknownClassesAsObjects) return { t: 'object', v: mapValues(v, (o) => serializeProp(o)) }
      throw new Error('Can not serialize unknown object')
    }

    // function, symbol
    if (unknownNonObjectsPassthrough) return v
    throw new Error('Can not serialize value of unsupported type')
  }

  const serializeProp = skipUndefinedProperties
    ? (v) => (v === undefined ? v : serialize(v))
    : serialize

  const deserialize = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value
    const keys = Object.keys(value)
    if (
      keys.length === 2 &&
      ((keys[0] === 't' && keys[1] === 'v') || (keys[1] === 'v' && keys[0] === 't'))
    ) {
      const { t, v } = value
      // Fast path
      if (t === 'object') return mapValues(v, (o) => deserialize(o))
      if (t === 'array') return v.map((o) => deserialize(o))
      if (t === 'bigint') return BigInt(v) // primitive
      if (t === 'date') return new Date(v)
      if (t === 'buffer') return fromBase64(v, 'buffer')
      if (t === 'uint8array') return fromBase64(v)

      const de = demap.get(t)
      return de ? de(v) : value
    }

    if (keys.length === 1 && keys[0] === 't' && value.t === 'undef') return // { t: 'undef' } is undefined
    return value
  }

  return { serialize, deserialize }
}
