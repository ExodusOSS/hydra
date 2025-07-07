import { SafeError } from '@exodus/errors'
import { z } from '@exodus/zod'

import safeParse from '../safe-parse.js'

const unexpectedTypesFixtures = [
  {
    name: 'unexpected type (null)',
    data: null,
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
  {
    name: 'unexpected type (boolean)',
    data: false,
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
  {
    name: 'unexpected type (undefined)',
    data: undefined,
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
  {
    name: 'unexpected type (string)',
    data: 'unexpected string',
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
  {
    name: 'unexpected type (number)',
    data: 123,
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
  {
    name: 'unexpected type (bigint)',
    data: 123n,
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    expected: null,
  },
]

const nameWithAgeSchema = z.object({
  name: z.string(),
  age: z.number(),
})

const validDataFixtures = [
  {
    name: 'valid data [1]',
    data: { name: 'Alice', age: 30 },
    schema: nameWithAgeSchema,
  },
  {
    name: 'valid data [2]',
    data: { data: [{ name: 'Alice', age: 30 }] },
    schema: z.object({
      data: z.array(nameWithAgeSchema),
    }),
  },
  {
    name: 'valid data [3]',
    data: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 15 },
    ],
    schema: z.array(nameWithAgeSchema),
  },
  {
    name: 'valid data [4]',
    data: ['Alice', 'Bob', 'Charlie'],
    schema: z.array(z.string()),
  },
  {
    name: 'valid data [5]',
    data: {
      exodus_0: {
        balances: {
          bitcoin: '1 BTC',
          ethereum: '1 ETH',
        },
      },
      exodus_1: {
        balances: {
          bitcoin: '1.3 BTC',
          ethereum: '2 ETH',
        },
      },
    },
    schema: z.record(
      z.string(),
      z
        .object({
          balances: z.record(z.string(), z.string()),
        })
        .strict()
    ),
  },
  {
    name: 'valid nullable data',
    data: null,
    schema: z
      .object({
        name: z.string(),
        age: z.number(),
      })
      .nullable(),
  },
  {
    name: 'safe error',
    data: { error: SafeError.from(new Error('test error')) },
    schema: z
      .object({
        error: z.instanceof(SafeError),
      })
      .nullable(),
  },
  {
    name: 'record with valid keys and values',
    data: {
      exodus_0: 'Alice',
      exodus_1: 'Bob',
      ledger_0_ddd: 'Charlie',
      trezor_0: 'Dave',
    },
    schema: z.record(z.string(), z.string()).nullable(),
  },
  {
    name: 'empty object (edge case)',
    data: {},
    schema: z.record(z.string(), z.string()).nullable(),
  },
  {
    name: 'null (edge case)',
    data: null,
    schema: z.record(z.string(), z.string()).nullable(),
  },
]

const unvalidatedDataFixtures = [
  {
    name: 'invalid high-level property',
    data: { name: 'Alice', age: 'thirty' },
    schema: z.object({
      name: z.string().nullable(),
      age: z.number(),
    }),
    expected: { name: 'Alice', age: null },
  },
  {
    name: 'unexpected high-level property',
    data: { name: 'Alice', age: 30, extra: 'extra' },
    schema: z.object({
      name: z.string().nullable(),
      age: z.number(),
    }),
    expected: { name: 'Alice', age: 30 },
  },
  {
    name: 'unexpected high-level property when using `object.strict()`',
    data: { name: 'Alice', age: 30, extra: 'extra' },
    schema: z
      .object({
        name: z.string(),
        age: z.number(),
      })
      .strict(),
    expected: { name: 'Alice', age: 30 },
  },
  {
    name: 'nested invalid property [1]',
    data: { data: [{ name: 'Alice', age: 30, extra: { nested: false } }] },
    schema: z.object({
      data: z.array(z.object({ name: z.string(), age: z.number().nullable() })),
    }),
    expected: { data: [{ name: 'Alice', age: 30 }] },
  },
  {
    name: 'nested invalid property [2]',
    data: { name: 'Alice', age: 30, extra: { nested: false, expectedNested: null } },
    schema: z.object({
      name: z.string(),
      age: z.number(),
      extra: z.object({
        nested: z.string(),
        expectedNested: z.string().nullable(),
      }),
    }),
    expected: { name: 'Alice', age: 30, extra: { nested: null, expectedNested: null } },
  },
  {
    name: 'nested invalid property [3]',
    data: { name: 'Alice', age: 30, extra: { nested: 'valid', prop: 'invalid' } },
    schema: z.object({
      name: z.string(),
      age: z.number(),
      extra: z.object({
        nested: z.string(),
        prop: z.boolean(),
      }),
    }),
    expected: { name: 'Alice', age: 30, extra: { nested: 'valid', prop: null } },
  },
  {
    name: 'invalid property in a nested list',
    data: {
      name: 'Alice',
      age: undefined,
      extra: [
        { nested: 'valid', prop: 'invalid' },
        { nested: 'valid', prop: true },
        { nested: 'valid', prop: true, unexpected: true },
      ],
    },
    schema: z.object({
      name: z.string().optional(),
      age: z.number(),
      extra: z.array(
        z.object({
          nested: z.string(),
          prop: z.boolean(),
        })
      ),
    }),
    expected: {
      name: 'Alice',
      age: null,
      extra: [
        { nested: 'valid', prop: null },
        { nested: 'valid', prop: true },
        { nested: 'valid', prop: true },
      ],
    },
  },
  {
    name: 'invalid primitive types in a nested list',
    data: {
      data: ['Alice', 1, 'Bob', 2, 'Charlie', null],
    },
    schema: z.object({
      data: z.array(z.string().nullable()),
    }),
    expected: {
      data: ['Alice', null, 'Bob', null, 'Charlie', null],
    },
  },
  {
    name: 'invalid types in a nested list',
    data: {
      data: ['Alice', 1, 'Bob', 2, 'Charlie', ['Alice', 'Bob', 'Charlie'], null],
    },
    schema: z.object({
      data: z.array(z.string().nullable()),
    }),
    expected: {
      data: ['Alice', null, 'Bob', null, 'Charlie', null, null],
    },
  },
  {
    name: 'invalid object properties in a nested list',
    data: {
      data: [
        { name: 'Alice', age: 30 },
        { name: 'Alice', age: 'thirty' },
      ],
    },
    schema: z.object({
      data: z.array(
        z.object({
          name: z.string(),
          age: z.number(),
        })
      ),
    }),
    expected: {
      data: [
        { name: 'Alice', age: 30 },
        { name: 'Alice', age: null },
      ],
    },
  },
  {
    name: 'nested unexpected property',
    data: {
      name: 'Alice',
      age: 30,
      extra: { nested: 'valid', prop: { nested: 'valid', prop: 'unexpected' } },
    },
    schema: z.object({
      name: z.string(),
      age: z.number(),
      extra: z.object({
        nested: z.string(),
        prop: z.object({
          nested: z.string(),
        }),
      }),
    }),
    expected: { name: 'Alice', age: 30, extra: { nested: 'valid', prop: { nested: 'valid' } } },
  },
  {
    name: 'record with unexpected keys',
    data: {
      exodus_0: 'Alice',
      exodus_1: 'Bob',
      ledger_0_ddd: 'Charlie',
      trezor_0: 'Dave',
    },
    schema: z.record(z.string().regex(/^(exodus|ledger)/u), z.string().nullable()),
    expected: {
      exodus_0: 'Alice',
      exodus_1: 'Bob',
      ledger_0_ddd: 'Charlie',
    },
  },
  {
    name: 'record with unexpected keys and invalid values',
    data: {
      exodus_0: 'Alice',
      exodus_1: false,
      ledger_0_ddd: 'Charlie',
      trezor_0: 'Dave',
    },
    schema: z.record(z.string().regex(/^(exodus|ledger)/u), z.string()),
    expected: {
      exodus_0: 'Alice',
      exodus_1: null,
      ledger_0_ddd: 'Charlie',
    },
  },
]

describe('safeParse', () => {
  validDataFixtures.forEach(({ name, data, schema }) => {
    it(`should handle ${name}`, () => {
      expect(safeParse(schema, data)).toEqual(data)
    })
  })

  const combinedFixtures = [...unexpectedTypesFixtures, ...unvalidatedDataFixtures]

  combinedFixtures.forEach(({ name, data, schema, expected }) => {
    it(`should handle ${name}`, () => {
      expect(safeParse(schema, data)).toEqual(expected)
    })
  })

  combinedFixtures
    .map((fixture) => ({
      ...fixture,
      name: `${fixture.name} (nullable schema)`,
      schema: fixture.schema.nullable(),
    }))
    .forEach(({ name, data, schema, expected }) => {
      it(`should handle ${name}`, () => {
        expect(safeParse(schema, data)).toEqual(expected)
      })
    })
})
