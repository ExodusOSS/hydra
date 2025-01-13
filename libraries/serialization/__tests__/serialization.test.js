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

const { serialize, deserialize } = createSerializeDeserialize()
describe('without custom types', () => {
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
  })
})

describe('custom types', () => {
  const { serialize, deserialize } = createSerializeDeserialize([
    {
      type: 'person',
      test: (v) => v instanceof Person,
      serialize: (v) => v.toJSON(),
      deserialize: (v) => new Person(v.firstName, v.lastName),
    },
  ])
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
})
