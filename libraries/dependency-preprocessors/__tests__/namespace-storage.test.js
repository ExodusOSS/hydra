import createInMemoryStorage from '@exodus/storage-memory'

import namespaceStoragePreprocessor from '../src/preprocessors/namespace-storage.js'

const identity = (data) => data

describe('namespace-storage preprocessor', () => {
  describe('validates options', () => {
    it.each([
      {
        name: 'missing "namespace"',
        input: {
          definition: {},
          storage: {},
        },
        valid: false,
      },
      {
        name: 'non-string "namespace"',
        input: {
          definition: {},
          storage: {
            namespace: 1,
          },
        },
      },
      {
        name: 'empty string "namespace"',
        input: {
          definition: {},
          storage: {
            namespace: '',
          },
        },
        valid: false,
      },
      {
        name: 'empty array "namespace"',
        input: {
          definition: {},
          storage: {
            namespace: [],
          },
        },
        valid: false,
      },
      {
        name: 'array with empty string namespace',
        input: {
          definition: {},
          storage: {
            namespace: [''],
          },
        },
        valid: false,
      },
      {
        name: 'valid string namespace',
        input: {
          definition: {},
          storage: {
            namespace: '1',
          },
        },
        valid: true,
      },
      {
        name: 'valid array namespace',
        input: {
          definition: {},
          storage: {
            namespace: ['1'],
          },
        },
        valid: true,
      },
      {
        name: 'non-string "interfaceId"',
        input: {
          definition: {},
          storage: {
            namespace: '1',
            interfaceId: 2,
          },
        },
        valid: false,
      },
      {
        name: 'valid interfaceId',
        input: {
          definition: {},
          storage: {
            namespace: '1',
            interfaceId: 'blah',
          },
        },
        valid: true,
      },
    ])('storage preprocessor options: $name', ({ input, valid }) => {
      if (valid) expect(() => namespaceStoragePreprocessor().preprocess(input)).not.toThrow()
      else expect(() => namespaceStoragePreprocessor().preprocess(input)).toThrow()
    })
  })

  describe('it namespaces storage', () => {
    let storage
    let store
    beforeEach(() => {
      store = new Map()
      storage = createInMemoryStorage({ store })
    })

    it.each([
      {
        name: 'string namespace',
        opts: {
          namespace: 'a',
        },
        dependencies: ['storage'],
        storageContents: new Map([['!a!leafValue', '1']]),
      },
      {
        name: 'single-level array namespace',
        opts: {
          namespace: ['a'],
        },
        dependencies: ['storage'],
        storageContents: new Map([['!a!leafValue', '1']]),
      },
      {
        name: 'multi-level array namespace',
        opts: {
          namespace: ['a', 'b'],
        },
        dependencies: ['storage'],
        storageContents: new Map([['!a!!b!leafValue', '1']]),
      },
      {
        name: 'custom storage interfaceId',
        opts: {
          namespace: 'a',
          interfaceId: 'otherStorage',
        },
        dependencies: ['otherStorage'],
        storageContents: new Map([['!a!leafValue', '1']]),
      },
    ])('should namespace storage with: $name', async ({ opts, dependencies, storageContents }) => {
      const { definition } = namespaceStoragePreprocessor().preprocess({
        definition: {
          factory: identity,
          dependencies,
        },
        storage: opts,
      })

      const storageInterfaceId = opts.interfaceId || 'storage'
      const { [storageInterfaceId]: namespaced } = definition.factory({
        [storageInterfaceId]: storage,
      })

      await namespaced.set('leafValue', 1)
      expect(store).toEqual(storageContents)
    })

    it('passes through other options', () => {
      const otherStuff = {}
      const { definition, storage, ...rest } = namespaceStoragePreprocessor().preprocess({
        definition: {
          factory: identity,
          dependencies: ['storage'],
        },
        storage: {
          namespace: 'a',
        },
        otherStuff,
      })

      expect(storage).toEqual(undefined)
      expect(definition).toBeDefined()
      expect(rest.otherStuff).toEqual(otherStuff)
    })
  })
})
