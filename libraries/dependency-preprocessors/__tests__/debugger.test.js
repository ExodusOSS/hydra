import debuggerPreprocessor from '../src/preprocessors/debugger.js'
import createInMemoryStorage from '@exodus/storage-memory'
import { createInMemoryAtom } from '@exodus/atoms'
import preprocess from '../src/index.js'

const debugEnabledDeps = { config: { debug: true } }

const setup = ({ debug, unsafeStorage }) => {
  const node = {
    definition: {
      id: 'wayneManor',
      type: 'debug',
      factory: ({ batmobileAtom }) => ({ set: batmobileAtom.set }),
      dependencies: ['batmobileAtom'],
    },
  }

  const batmobileAtom = {
    definition: {
      id: 'batmobileAtom',
      type: 'atom',
      factory: () => createInMemoryAtom(),
      dependencies: [],
    },
  }

  const processed = preprocess({
    dependencies: [node, batmobileAtom],
    preprocessors: [debuggerPreprocessor({ debug, unsafeStorage })],
  })

  return { processed, definitions: [node.definition, batmobileAtom.definition] }
}

describe('debugger', () => {
  describe('production', () => {
    const debug = false

    test('should return same nodes', () => {
      const unsafeStorage = createInMemoryStorage()

      const { processed, definitions } = setup({ debug, unsafeStorage })

      expect(processed).toEqual(definitions)
    })
  })

  describe('development', () => {
    describe('debug enabled through config', () => {
      const debug = true

      test('atoms should set passed value when not cached', async () => {
        const unsafeStorage = createInMemoryStorage()

        const { processed } = setup({ debug, unsafeStorage })

        const batmobileAtom = processed[1].factory(debugEnabledDeps)

        await batmobileAtom.set('test')

        await expect(batmobileAtom.get()).resolves.toEqual('test')
      })

      test('atoms should set cached value when present', async () => {
        const unsafeStorage = createInMemoryStorage()

        const { processed } = setup({ debug, unsafeStorage })

        await unsafeStorage.namespace('debug').set('batmobileAtom', 'other')

        const batmobileAtom = processed[1].factory(debugEnabledDeps)

        await expect(batmobileAtom.get()).resolves.toEqual('other')

        await batmobileAtom.set('test')

        await expect(batmobileAtom.get()).resolves.toEqual('other')
      })

      test('atoms in debug node should persist data', async () => {
        const unsafeStorage = createInMemoryStorage()

        const { processed } = setup({ debug, unsafeStorage })

        const batmobileAtom = processed[1].factory(debugEnabledDeps)
        const wayneManor = processed[0].factory({ ...debugEnabledDeps, batmobileAtom })

        await wayneManor.set('other')

        await expect(unsafeStorage.namespace('debug').get('batmobileAtom')).resolves.toEqual(
          'other'
        )
      })
    })

    describe('debug disabled (missing in config)', () => {
      const debug = false

      test('atoms should return original value', async () => {
        const unsafeStorage = createInMemoryStorage()
        const { processed } = setup({ debug, unsafeStorage })
        const batmobileAtom = processed[1].factory()
        await batmobileAtom.set('test')
        await unsafeStorage.namespace('debug').set('batmobileAtom', 'other')
        await expect(batmobileAtom.get()).resolves.toEqual('test')
      })
    })
  })
})
