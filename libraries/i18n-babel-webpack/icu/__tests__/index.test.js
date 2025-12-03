const { interpolate, parse, stringify } = require('../index.js')

const scenarios = [
  {
    case: 'simple message',
    id: 'Enter password',
    value: [{ type: 'text', value: 'Enter password' }],
  },
  {
    case: 'dynamic message',
    id: 'Your {asset.properName} Address',
    value: [
      { type: 'text', value: 'Your ' },
      { type: 'arg', name: 'asset.properName', position: 0 },
      { type: 'text', value: ' Address' },
    ],
  },
  {
    case: 'dynamic message with positional name',
    id: 'Your {0} Address',
    value: [
      { type: 'text', value: 'Your ' },
      { type: 'arg', name: '0', position: 0 },
      { type: 'text', value: ' Address' },
    ],
  },
  {
    case: 'dynamic message type and subtype',
    id: 'Slippage {slippagePercent, number, percent}.',
    value: [
      { type: 'text', value: 'Slippage ' },
      { type: 'arg', name: 'slippagePercent', position: 0, format: 'number', subType: 'percent' },
      { type: 'text', value: '.' },
    ],
  },
]

describe('icu', () => {
  describe('parse', () => {
    scenarios.forEach((scenario) => {
      test(`should parse ${scenario.case}`, () => {
        const result = parse(scenario.id)
        expect(result).toEqual(scenario.value)
      })
    })
  })

  describe('stringify', () => {
    scenarios.forEach((scenario) => {
      test(`should stringify ${scenario.case}`, () => {
        const result = stringify(scenario.value)
        expect(result).toEqual(scenario.id)
      })
    })
  })

  describe('interpolate', () => {
    test('should interpolate simple message', () => {
      const tokens = [{ type: 'text', value: 'Enter password' }]
      const result = interpolate(tokens, {})

      expect(result).toEqual('Enter password')
    })

    test('should interpolate dynamic message', () => {
      const tokens = [
        { type: 'text', value: 'Your ' },
        { type: 'arg', name: 'asset.properName', position: 0 },
        { type: 'text', value: ' Address' },
      ]
      const result = interpolate(tokens, {
        'asset.properName': { value: 'bitcoin', positions: [0] },
      })

      expect(result).toEqual('Your bitcoin Address')
    })

    test('should interpolate dynamic message with alternate name', () => {
      const tokens = [
        { type: 'text', value: 'Your ' },
        { type: 'arg', name: 'asset.properName', position: 0 },
        { type: 'text', value: ' Address' },
      ]
      const result = interpolate(tokens, {
        'asset.displayName': { value: 'bitcoin', positions: [0] },
      })

      expect(result).toEqual('Your bitcoin Address')
    })

    test('should interpolate dynamic message with positional name', () => {
      const tokens = [
        { type: 'text', value: 'Your ' },
        { type: 'arg', name: '0', position: 0 },
        { type: 'text', value: ' Address' },
      ]
      const result = interpolate(tokens, { 0: { value: 'bitcoin', positions: [0] } })

      expect(result).toEqual('Your bitcoin Address')
    })

    test('should interpolate dynamic message with multiple variables', () => {
      const tokens = [
        { type: 'text', value: 'Your ' },
        { type: 'arg', name: 'assetName', position: 0 },
        { type: 'text', value: ' Address, ' },
        { type: 'arg', name: 'name', position: 1 },
      ]
      const result = interpolate(tokens, {
        assetName: { value: 'bitcoin', positions: [0] },
        name: { value: 'Exodus', position: [1] },
      })

      expect(result).toEqual('Your bitcoin Address, Exodus')
    })

    test('should interpolate dynamic message with re-used, alternate variable', () => {
      const tokens = [
        { type: 'text', value: 'Hi ' },
        { type: 'arg', name: 'character', position: 0 },
        { type: 'text', value: '! How are you, ' },
        { type: 'arg', name: 'character', position: 1 },
        { type: 'text', value: '?' },
      ]
      const result = interpolate(tokens, {
        name: { value: 'Harry', positions: [0, 1] },
      })

      expect(result).toEqual('Hi Harry! How are you, Harry?')
    })

    test('should interpolate dynamic message with re-used variables', () => {
      const tokens = [
        { type: 'text', value: 'Hi ' },
        { type: 'arg', name: 'name', position: 0 },
        { type: 'text', value: '! How are you, ' },
        { type: 'arg', name: 'name', position: 1 },
        { type: 'text', value: '?' },
      ]
      const result = interpolate(tokens, {
        name: { value: 'Harry', positions: [0, 1] },
      })

      expect(result).toEqual('Hi Harry! How are you, Harry?')
    })

    test('should interpolate with correct formatter', () => {
      const tokens = [
        { type: 'text', value: 'I have ' },
        { type: 'arg', format: 'number', name: 'age', position: 0 },
        { type: 'text', value: ' years old' },
      ]

      const formatters = { number: (value) => `_${value}_` }

      const result = interpolate(tokens, { age: { value: 10, position: 0 } }, formatters)

      expect(result).toEqual('I have _10_ years old')
    })
  })
})
