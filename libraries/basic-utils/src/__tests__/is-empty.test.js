import lodash from 'lodash'

import { isEmpty } from '../lodash.js'

const emptyValues = [
  {
    name: 'null',
    value: null,
  },
  {
    name: 'undefined',
    value: undefined,
  },
  {
    name: 'empty array',
    value: [],
  },
  {
    name: 'empty object',
    value: {},
  },
  {
    name: 'empty object created with Object.create(null)',
    value: Object.create(null),
  },
  {
    name: 'empty string',
    value: '',
  },
  {
    name: 'empty set',
    value: new Set(),
  },
  {
    name: 'empty map',
    value: new Map(),
  },
  {
    name: 'number',
    value: () => 1,
  },
  {
    name: 'boolean',
    value: () => true,
  },
]

const nonEmptyValues = [
  {
    name: 'non-empty array',
    value: [1, 2, 3],
  },
  {
    name: 'non-empty object',
    value: { a: 1 },
  },
  {
    name: 'non-empty set',
    value: new Set([1, 2, 3]),
  },
  {
    name: 'non-empty map',
    value: new Map([['a', 1]]),
  },
  {
    name: 'non-empty string',
    value: 'hello',
  },
]

describe('isEmpty', () => {
  for (const { name, value } of emptyValues) {
    it(`returns true for ${name}`, () => {
      expect(isEmpty(value)).toBe(true)
      expect(lodash.isEmpty(value)).toBe(true)
    })
  }

  for (const { name, value } of nonEmptyValues) {
    it(`returns false for ${name}`, () => {
      expect(isEmpty(value)).toBe(false)
      expect(lodash.isEmpty(value)).toBe(false)
    })
  }
})
