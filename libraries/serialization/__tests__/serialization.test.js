import createSerializeDeserialize from '../src/index.js'

class Person {
  constructor(firstName, lastName) {
    this.name = `${firstName} ${lastName}`
  }

  toJSON() {
    const [firstName, lastName] = this.name.split(' ')
    return { firstName, lastName }
  }
}
const date1 = new Date(1)
const date2 = new Date(2)

const dateMatcher = (v, d) => v instanceof Date && d.getTime() === v.getTime()

// Re-create a serialized `{ t, v }` wrapper with its keys in reversed (`{ v, t }`) insertion order
const reverseKeys = (obj) => Object.fromEntries(Object.entries(obj).reverse())

describe('without custom types', () => {
  const { serialize, deserialize } = createSerializeDeserialize({ skipUndefinedProperties: true })

  test.each([
    { name: 'boolean', value: true },
    { name: 'number', value: 42 },
    {
      name: 'bigint',
      value: BigInt('11111111111111111111111111111111111111111111111111111'),
      matcher: (v) => v === BigInt('11111111111111111111111111111111111111111111111111111'),
    },
    { name: 'array', value: [1, 2, 3] },
    { name: 'object', value: { foo: 'bar' } },
    {
      name: 'buffer',
      value: Buffer.from('Hello'),
      matcher: (v) => Buffer.isBuffer(v) && v.toString('utf8') === 'Hello',
    },
    {
      name: 'Uint8Array',
      value: new Uint8Array([32, 42]),
      matcher: (v) => v instanceof Uint8Array && !Buffer.isBuffer(v) && v[0] === 32 && v[1] === 42,
    },
    { name: 'date', value: new Date(), matcher: dateMatcher },
    {
      name: 'recursive array exploration',
      value: [date1, date2],
      matcher: ([v1, v2]) => dateMatcher(v1, date1) && dateMatcher(v2, date2),
    },
    {
      name: 'recursive object exploration',
      value: { foo: date1, bar: { baz: date2 } },
      matcher: ({ foo, bar: { baz } }) => dateMatcher(foo, date1) && dateMatcher(baz, date2),
    },
  ])('$name', ({ value, matcher }) => {
    const serialized = serialize(value)
    // ensure values are fully JSON-serialized
    expect(JSON.parse(JSON.stringify(serialized))).toStrictEqual(serialized)
    const deserialized = deserialize(serialized)
    if (matcher) expect(matcher(deserialized, value)).toBe(true)
    else expect(JSON.stringify(deserialized)).toBe(JSON.stringify(value))
  })

  test('keeps undefined in arrays', () => {
    const value = { args: [undefined] }
    const serialized = serialize(value)

    expect(JSON.parse(JSON.stringify(serialized))).toStrictEqual({
      t: 'object',
      v: {
        args: {
          t: 'array',
          v: [
            {
              t: 'undef',
            },
          ],
        },
      },
    })

    const deserialized = deserialize(serialized)
    expect(JSON.stringify(deserialized)).toBe(JSON.stringify(value))
  })

  test('does not change undefined properties', () => {
    const serialized = serialize({ prop: undefined })

    expect('prop' in serialized).toBe(false)
    expect(serialized).toStrictEqual({
      t: 'object',
      v: {
        prop: undefined,
      },
    })
    expect(deserialize(serialized)).toStrictEqual({ prop: undefined })
  })
})

describe('without skipUndefinedProperties', () => {
  const { serialize, deserialize } = createSerializeDeserialize()

  test('serializes undefined properties', () => {
    const serialized = serialize({ prop: undefined })

    expect('prop' in serialized).toBe(false)
    expect(serialized).toStrictEqual({
      t: 'object',
      v: {
        prop: { t: 'undef' },
      },
    })
    expect(deserialize(serialized)).toStrictEqual({ prop: undefined })
  })
})

describe('reversed key order', () => {
  // `deserialize` detects the typed wrapper by key, so it must match both `{ t, v }` and the
  // reversed `{ v, t }` order. Otherwise reversed payloads bypass the typed-deserialize path and
  // are returned as plain wrapper objects instead of their original value.
  const { serialize, deserialize } = createSerializeDeserialize()

  test.each([
    { name: 'bigint', value: BigInt('11111111111111111111111111111111111111111111111111111') },
    { name: 'date', value: new Date(1) },
    { name: 'buffer', value: Buffer.from('Hello') },
    { name: 'Uint8Array', value: new Uint8Array([32, 42]) },
    { name: 'object', value: { foo: 'bar' } },
    { name: 'array', value: [1, 2, 3] },
  ])('deserializes a reversed $name wrapper', ({ value }) => {
    const reversed = reverseKeys(serialize(value))
    expect(Object.keys(reversed)).toStrictEqual(['v', 't']) // guard: input really is reversed

    expect(deserialize(reversed)).toStrictEqual(value)
  })

  test('deserializes a reversed wrapper nested inside an object', () => {
    // `deserialize` recurses into object values, so reversed wrappers must be matched at any depth
    const serialized = { t: 'object', v: { big: reverseKeys(serialize(BigInt(5))) } }
    expect(deserialize(serialized)).toStrictEqual({ big: BigInt(5) })
  })
})

describe('custom types', () => {
  const typeDefinitions = [
    {
      type: 'person',
      class: Person,
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new Person(v.firstName, v.lastName),
    },
  ]
  const { serialize, deserialize } = createSerializeDeserialize({ typeDefinitions })
  const johnDoe = new Person('John', 'Doe')
  test('Person', () => {
    const serialized = serialize(johnDoe)
    expect(serialized).toEqual({ t: 'person', v: { firstName: 'John', lastName: 'Doe' } })
    const deserialized = deserialize(serialized)
    expect(deserialized).not.toBe(johnDoe) // won't be the exact same instance
    expect(deserialized.name).toBe(johnDoe.name)
  })
  test('nested Person', () => {
    const deserializedPerson = deserialize(serialize([{ guy: johnDoe }]))[0].guy
    expect(deserializedPerson).not.toBe(johnDoe) // won't be the exact same instance
    expect(deserializedPerson.name).toBe(johnDoe.name)
  })
  test('reversed Person wrapper', () => {
    const reversed = reverseKeys(serialize(johnDoe))
    expect(Object.keys(reversed)).toStrictEqual(['v', 't']) // guard: input really is reversed

    const deserialized = deserialize(reversed)
    expect(deserialized).not.toBe(johnDoe) // won't be the exact same instance
    expect(deserialized instanceof Person).toBe(true)
    expect(deserialized.name).toBe(johnDoe.name)
  })
})
