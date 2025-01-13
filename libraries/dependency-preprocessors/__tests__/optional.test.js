import optional from '../src/preprocessors/optional.js'
import preprocess from '../src/index.js'
import alias from '../src/preprocessors/alias.js'
import config from '../src/preprocessors/config.js'

describe('optional', () => {
  it('should return null if condition evaluates to false', () => {
    const enableQuidditch = false

    const node = {
      if: enableQuidditch,
      definition: {
        id: 'hogwartsLegacyQuidditchSeason',
        factory: jest.fn(),
        dependencies: ['quaffle', 'bludgers', 'snitch', 'broomsticks', 'clubs', 'pitch'],
      },
    }

    expect(optional().preprocess(node, {})).toBe(null)
  })

  it('should return node if condition evaluates to true', () => {
    const enableQuidditch = true

    const node = {
      if: enableQuidditch,
      definition: {
        id: 'quidditchWorldCup',
        factory: jest.fn(),
        dependencies: ['quaffle', 'bludgers', 'snitch', 'broomsticks', 'clubs', 'pitch'],
      },
    }

    expect(optional().preprocess(node, {})).toBe(node)
  })

  it('should return null if condition evaluates to undefined', () => {
    const node = {
      if: undefined,
      definition: {
        id: 'testingNode',
        factory: jest.fn(),
        dependencies: ['dep1'],
      },
    }

    expect(optional().preprocess(node, {})).toBe(null)
  })

  it('should filter null values', () => {
    const voldemortImpressedByLumos = false

    const dependencies = [
      {
        definition: {
          id: 'config',
          dependencies: [],
          factory: () => ({}),
        },
      },
      {
        definition: {
          id: 'harry',
          factory: jest.fn(),
          dependencies: ['hermione', 'ron'],
        },
      },
      {
        if: voldemortImpressedByLumos,
        definition: {
          id: 'harryWillSurvive',
          factory: jest.fn(),
          dependencies: ['config'],
        },
      },
    ]

    const preprocessed = preprocess({
      dependencies,
      preprocessors: [alias(), optional(), config()],
    })

    expect(preprocessed).toEqual([
      {
        ...dependencies[0].definition,
        factory: expect.any(Function),
      },
      {
        ...dependencies[1].definition,
        factory: expect.any(Function),
      },
    ])
  })

  const createNode = (id, options = {}) => {
    return {
      definition: {
        id,
        factory: () => id,
        dependencies: [],
      },
      ...options,
    }
  }

  describe('registered', () => {
    it('should keep node if all deps present', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents'),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual(['hogwarts', 'potter', 'pottersParents'])
    })

    it('should omit node if dependency listed in registered not present', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('hogsmeade'),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual(['hogwarts', 'hogsmeade'])
    })

    it('should omit node if required dependency removed through boolean condition', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents', { if: false }),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual(['hogwarts'])
    })

    it('should keep node if required dependency included through boolean condition', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents', { if: true }),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual(['hogwarts', 'potter', 'pottersParents'])
    })

    it('should omit node if required dependency omitted because one of its dependencies is not registered', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents', { if: { registered: ['pottersGrandParents'] } }),
          createNode('pottersGrandParents', { if: { registered: ['pottersGreatGrandParents'] } }),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual(['hogwarts'])
    })

    it('should keep node if all required dependencies recursively available', () => {
      const processed = preprocess({
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents', { if: { registered: ['pottersGrandParents'] } }),
          createNode('pottersGrandParents', { if: { registered: ['pottersGreatGrandParents'] } }),
          createNode('pottersGreatGrandParents'),
        ],
      })

      expect(processed.map((it) => it.id)).toEqual([
        'hogwarts',
        'potter',
        'pottersParents',
        'pottersGrandParents',
        'pottersGreatGrandParents',
      ])
    })

    it('should throw when encountering a cycle', () => {
      const params = {
        preprocessors: [optional()],
        dependencies: [
          createNode('hogwarts'),
          createNode('potter', { if: { registered: ['pottersParents'] } }),
          createNode('pottersParents', { if: { registered: ['pottersGrandParents'] } }),
          createNode('pottersGrandParents', { if: { registered: ['pottersGreatGrandParents'] } }),
          createNode('pottersGreatGrandParents', { if: { registered: ['potter'] } }),
        ],
      }
      expect(() => preprocess(params)).toThrow(
        'Optional preprocessor dependency requirements are cyclic: potter --> pottersParents --> pottersGrandParents --> pottersGreatGrandParents --> potter'
      )
    })
  })
})
