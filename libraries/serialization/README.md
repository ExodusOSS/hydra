# @exodus/serialization

Serialize and deserialize data, e.g. for sending over the wire. Supports arrays, `Date`, `Buffer`, `Uint8Array`, `BigInt` out of the box, as well as the ability to extend with custom types.

## Install

```sh
yarn add @exodus/serialization
```

## Usage

### Vanilla

```js
import createSerializeDeserialize from '@exodus/serialization'

const { serialize, deserialize } = createSerializeDeserialize()

const original = { hello: Buffer.from('world') }
const fromOverTheWire = deserialize(serialize(original))
expect(fromOverTheWire).toEqual(original)
```

### Custom types

To add your own types, provide a type definition consisting of

- `type`: a **unique** string identifier for the type
- `test`: a function that returns `true` if the value is an instance of the type
- `serialize`: a function that serializes a value of the type
- `deserialize`: a function that deserializes a value of the type

For example, if `BigInt` serialization wasn't built-in, you could add support as follows:

```js
const { serialize, deserialize } = createSerializeDeserialize([
  {
    type: 'bigint',
    test: (v) => typeof v === 'bigint',
    serialize: (v) => v.toString(),
    deserialize: (v) => BigInt(v),
  },
])

const original = {
  question: 'what is the biggest number in the universe?',
  answer: BigInt(42),
}

const fromOverTheWire = deserialize(serialize(original))
expect(fromOverTheWire).toEqual(original)
```
