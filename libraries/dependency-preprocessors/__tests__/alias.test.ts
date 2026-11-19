import aliasPreprocessor from '../src/preprocessors/alias.js'

const identity = (data) => data

describe('alias unit tests', () => {
  it('validates aliases', () => {
    expect(() =>
      aliasPreprocessor()({
        definition: {},
        aliases: {},
      })
    ).toThrow()

    expect(() =>
      aliasPreprocessor()({
        definition: {},
        aliases: [
          {
            implementationId: 123,
          },
        ],
      })
    ).toThrow()

    expect(() =>
      aliasPreprocessor()({
        definition: {},
        aliases: [
          {
            implementationId: 'a',
          },
        ],
      })
    ).toThrow()
  })

  it('resolves aliases', () => {
    const { definition } = aliasPreprocessor().preprocess({
      definition: {
        factory: identity,
        dependencies: ['interfaze'],
      },
      aliases: [
        {
          implementationId: 'implementation',
          interfaceId: 'interfaze',
        },
      ],
    })

    expect(definition.factory({ implementation: 'a' })).toEqual({ interfaze: 'a' })
  })

  it('resolves aliases for optional dependencies', () => {
    const { definition } = aliasPreprocessor().preprocess({
      definition: {
        factory: identity,
        dependencies: ['interfaze?'],
      },
      aliases: [
        {
          implementationId: 'implementation',
          interfaceId: 'interfaze',
        },
      ],
    })

    expect(definition.dependencies).toEqual(['implementation?'])
    expect(definition.factory({ implementation: 'a' })).toEqual({ interfaze: 'a' })
  })

  it('dependency id mapper passes through unaliased dependencies', () => {
    const { definition } = aliasPreprocessor().preprocess({
      definition: {
        factory: identity,
        dependencies: ['interfaze', 'unaliased'],
      },
      aliases: [
        {
          implementationId: 'implementation',
          interfaceId: 'interfaze',
        },
      ],
    })

    expect(definition.dependencies).toEqual(['implementation', 'unaliased'])
  })

  it('factory wrapper passes through unaliased implementations', () => {
    const { definition } = aliasPreprocessor().preprocess({
      definition: {
        factory: identity,
        dependencies: ['interfaze', 'unaliased'],
      },
      aliases: [
        {
          implementationId: 'implementation',
          interfaceId: 'interfaze',
        },
      ],
    })

    expect(definition.factory({ unaliased: 1, implementation: 2 })).toEqual({
      unaliased: 1,
      interfaze: 2,
    })
  })
})
