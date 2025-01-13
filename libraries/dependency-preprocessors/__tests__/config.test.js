import preprocess from '../src/index.js'
import configPreprocessor from '../src/preprocessors/config.js'

describe('config preprocessor', () => {
  const config = { jediSurvivor: { planet: 'Koboh' } }

  const configDefinition = {
    definition: {
      id: 'config',
      factory: () => config,
    },
  }

  const module = 'jediSurvivor'

  it('should supply config namespaced by module id', () => {
    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id: module,
            factory: ({ config }) => config,
            dependencies: ['config'],
          },
        },
      ],
      preprocessors: [configPreprocessor()],
    })
    const { factory } = deps.find((it) => it.id === module)

    expect(factory({ config })).toEqual(config.jediSurvivor)
  })

  it('should supply optional config namespaced by module id', () => {
    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id: module,
            factory: ({ config }) => config,
            dependencies: ['config?'],
          },
        },
      ],
      preprocessors: [configPreprocessor()],
    })
    const { factory } = deps.find((it) => it.id === module)

    expect(factory({ config })).toEqual(config.jediSurvivor)
  })

  it('should merge module config with config from definition', () => {
    const definitionConfig = {
      vader: { lightsaber: { color: 'red' } },
      diego: { lightsaber: { color: 'violâtre' } },
    }
    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id: module,
            factory: ({ config }) => config,
            dependencies: ['config'],
          },
          config: definitionConfig,
        },
      ],
      preprocessors: [configPreprocessor()],
    })
    const { factory } = deps.find((it) => it.id === module)

    expect(factory({ config })).toEqual({ ...definitionConfig, ...config.jediSurvivor })
  })

  it('module config should override config from definition', () => {
    const definitionConfig = { planet: 'Tatooine' }
    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id: module,
            factory: ({ config }) => config,
            dependencies: ['config'],
          },
          config: definitionConfig,
        },
      ],
      preprocessors: [configPreprocessor()],
    })
    const { factory } = deps.find((it) => it.id === module)

    expect(factory({ config })).toEqual(config.jediSurvivor)
  })

  it('should throw if config defined on definition but not as dependency', () => {
    expect(() =>
      preprocess({
        dependencies: [
          configDefinition,
          {
            definition: {
              id: module,
              factory: ({ config }) => config,
              dependencies: [],
            },
            config: {},
          },
        ],
        preprocessors: [configPreprocessor()],
      })
    ).toThrow('"config" specified on node but not as dependency of definition of "jediSurvivor"')
  })

  it('should throw if config is missing', () => {
    const id = 'someModule'
    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id,
            factory: ({ config }) => config,
            dependencies: ['config'],
          },
        },
      ],
      preprocessors: [configPreprocessor()],
    })

    const { factory } = deps.find((it) => it.id === id)
    expect(() => factory({})).toThrow(/expected "config" for "someModule"/)
  })

  it('should throw if config is not an object', () => {
    expect(() =>
      preprocess({
        dependencies: [
          configDefinition,
          {
            definition: {
              id: module,
              factory: ({ config }) => config,
              dependencies: ['config'],
            },
            config: true,
          },
        ],
        preprocessors: [configPreprocessor()],
      })
    ).toThrow(/expected "config" for "jediSurvivor" to be an object, got: boolean/)
  })

  it('wont forward dependencies config to factory when defition doesnt require config', () => {
    const factoryMock = jest.fn(({ config }) => config)
    const id = 'testModule'

    const deps = preprocess({
      dependencies: [
        configDefinition,
        {
          definition: {
            id,
            factory: factoryMock,
          },
        },
      ],

      preprocessors: [configPreprocessor()],
    })

    const { factory } = deps.find((it) => it.id === id)
    factory({ config: { unrelated: true } })

    expect(factoryMock).toHaveBeenCalledWith({})
  })
})
