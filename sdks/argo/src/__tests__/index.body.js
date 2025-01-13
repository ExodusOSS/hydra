import createIocContainer from '@exodus/dependency-injection'
import createIOC from '../index.js'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias.js'
import configPreprocessor from '@exodus/dependency-preprocessors/src/preprocessors/config.js'
import debuggerPreprocessor from '@exodus/dependency-preprocessors/src/preprocessors/debugger.js'
import devModeAtoms from '@exodus/dependency-preprocessors/src/preprocessors/dev-mode-atoms.js'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify.js'
import namespaceStorage from '@exodus/dependency-preprocessors/src/preprocessors/namespace-storage.js'
import namespacedErrorTracking from '@exodus/dependency-preprocessors/src/preprocessors/namespaced-error-tracking.js'
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional.js'
import performanceMonitor from '@exodus/dependency-preprocessors/src/preprocessors/performance-monitor.js'
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms.js'
import atomsIdentification from '@exodus/dependency-preprocessors/src/preprocessors/atoms-identification.js'

const adapters = {
  createLogger: (prefix) => ({
    debug: (...args) => console.log(prefix, ...args),
  }),
}

describe('argo', () => {
  let feature
  let registerMultipleInternal
  let resolveInternal

  beforeEach(() => {
    feature = () => ({
      id: 'test',
      definitions: [
        {
          definition: {
            id: 'someAtom',
            type: 'atom',
            factory: () => ({}),
            public: true,
          },
        },
        {
          definition: {
            id: 'someMonitor',
            type: 'monitor',
            factory: () => null,
            public: true,
          },
        },
      ],
    })

    registerMultipleInternal = createIocContainer().registerMultiple
    resolveInternal = createIocContainer().resolve
  })

  test('assigns feature id as namespace', () => {
    const ioc = createIOC({ adapters })
    const featureInstance = feature()

    ioc.use(featureInstance)
    ioc.resolve()

    const nodes = registerMultipleInternal.mock.calls[0][0]
    expect(nodes.length).toBeGreaterThan(0)
    expect(nodes.some((node) => node.namespace === featureInstance.id)).toBe(true)
  })

  describe('preprocessors', () => {
    test('use of logify', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(logify).toHaveBeenCalledWith({
        createLogger: adapters.createLogger,
      })
    })

    test('no performance monitor by default', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(performanceMonitor).not.toHaveBeenCalled()
    })

    test('use performance monitor when enabled', () => {
      const options = {
        adapters: {
          ...adapters,
          performance: {
            now: Date.now(),
            onAboveThreshold: jest.fn(),
          },
        },
        config: { ioc: { performanceMonitor: { enabled: true } } },
      }
      const ioc = createIOC(options)

      ioc.resolve()

      expect(performanceMonitor).toHaveBeenCalledWith({
        now: options.adapters.performance.now,
        onAboveThreshold: options.adapters.performance.onAboveThreshold,
        config: options.config.ioc.performanceMonitor,
      })
    })

    test('use config', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(configPreprocessor).toHaveBeenCalled()
    })

    test('use aliases', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(alias).toHaveBeenCalled()
    })

    test('use namespaced storage', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(namespaceStorage).toHaveBeenCalled()
    })

    test('use namespaced errorTracking', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(namespacedErrorTracking).toHaveBeenCalled()
    })

    test('use read only atoms', () => {
      const options = {
        adapters,
        config: {
          ioc: {
            readOnlyAtoms: {},
          },
        },
      }
      const ioc = createIOC(options)

      ioc.resolve()

      expect(readOnlyAtoms).toHaveBeenCalledWith({
        logger: expect.objectContaining({
          debug: expect.any(Function),
        }),
        warn: true,
        ...options.config.ioc.readOnlyAtoms,
      })
    })

    test('use optional deps', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(optional).toHaveBeenCalled()
    })

    test('no dev mode atoms by default', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(devModeAtoms).not.toHaveBeenCalled()
    })

    test('use dev mode atom if corresponding config provided', () => {
      const options = {
        adapters,
        config: {
          ioc: {
            devModeAtoms: {},
          },
        },
      }
      const ioc = createIOC(options)

      ioc.resolve()

      expect(devModeAtoms).toHaveBeenCalledWith(options.config.ioc.devModeAtoms)
    })

    test('no debugger by default', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(debuggerPreprocessor).not.toHaveBeenCalled()
    })

    test('use debugger if unsafe storage is provided', () => {
      const options = {
        adapters: {
          ...adapters,
          unsafeStorage: {},
        },
        debug: {},
      }
      const ioc = createIOC(options)

      ioc.resolve()

      expect(debuggerPreprocessor).toHaveBeenCalledWith({
        debug: options.debug,
        unsafeStorage: options.adapters.unsafeStorage,
      })
    })

    test('use atoms identification', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(atomsIdentification).toHaveBeenCalled()
    })
  })

  describe('registerMultiple', () => {
    test('multiple dependencies can be registered at once', () => {
      const definitions = [
        {
          definition: {
            id: 'test1',
            type: 'module',
            factory: () => null,
            public: true,
          },
        },
        {
          definition: {
            id: 'test2',
            type: 'module',
            factory: () => null,
            public: true,
          },
        },
      ]
      const ioc = createIOC({ adapters })

      ioc.registerMultiple(definitions)
      ioc.resolve()

      expect(registerMultipleInternal).toHaveBeenCalledWith(
        definitions.map((entry) => entry.definition)
      )
    })
  })

  describe('register', () => {
    test('registration of a single dependency', () => {
      const definition = {
        definition: {
          id: 'test',
          type: 'module',
          factory: () => null,
          public: true,
        },
      }

      const ioc = createIOC({ adapters })

      ioc.register(definition)
      ioc.resolve()

      expect(registerMultipleInternal).toHaveBeenCalledWith([definition.definition])
    })
  })

  describe('use', () => {
    test('should register dependencies if they have type field', () => {
      const ioc = createIOC({ adapters })

      expect(() => ioc.use(feature())).not.toThrow()
    })

    test('should throw if registered dependencies does not have type field', () => {
      const ioc = createIOC({ adapters })
      const featureInstance = feature()

      featureInstance.definitions.push({
        definition: {
          id: 'anotherAtom',
          factory: () => null,
          public: true,
        },
      })

      expect(() => ioc.use(featureInstance)).toThrow('"anotherAtom" is missing type field')
    })
  })

  describe('resolve', () => {
    test('call register multiple', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(registerMultipleInternal).toHaveBeenCalled()
    })

    test('call internal resolve', () => {
      const ioc = createIOC({ adapters })

      ioc.resolve()

      expect(resolveInternal).toHaveBeenCalled()
    })
  })
})
