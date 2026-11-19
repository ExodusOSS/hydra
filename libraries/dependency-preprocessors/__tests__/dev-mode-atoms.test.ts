import { createStorageAtomFactory } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import delay from 'delay'

import devModeAtomsPreprocessor from '../src/preprocessors/dev-mode-atoms.js'

jest.useFakeTimers({ doNotFake: ['setImmediate'] })

const advance = async (ms) => {
  jest.advanceTimersByTime(ms)
  await new Promise(setImmediate)
}

describe('dev-mode-atoms tests', () => {
  let logger
  let atom
  let atomCollection
  beforeEach(() => {
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
    }

    const voldie = createStorageAtomFactory({ storage: createInMemoryStorage(), logger })({
      key: 'voldie',
      isSoleWriter: true,
    })

    const { definition: atomDefinition } = devModeAtomsPreprocessor({
      logger,
      swallowObserverErrors: true,
      warnOnSameValueSet: true,
      timeoutObservers: {
        timeout: 100,
      },
    }).preprocess({
      definition: {
        id: 'voldie',
        type: 'atom',
        factory: () => voldie,
      },
    })

    const { definition: atomCollectionDefinition } = devModeAtomsPreprocessor({
      logger,
      swallowObserverErrors: true,
      warnOnSameValueSet: true,
      timeoutObservers: {
        timeout: 100,
      },
    }).preprocess({
      definition: {
        id: 'voldies',
        type: 'atom-collection',
        factory: () => ({ voldie }),
      },
    })

    atom = atomDefinition.factory()
    atomCollection = atomCollectionDefinition.factory()
  })

  describe.each([
    {
      name: 'atom',
      namespace: '[voldie]',
      getAtom: () => atom,
    },
    {
      name: 'atom-collection',
      namespace: '[voldies.voldie]',
      getAtom: () => atomCollection.voldie,
    },
  ])('test $name', ({ getAtom, namespace }) => {
    it('times observers out and swallows errors', async () => {
      const atom = getAtom()
      atom.observe(() => delay(1000))
      await new Promise(setImmediate)
      atom.set("don't wait up")
      await advance(200)
      expect(logger.error).toHaveBeenCalledWith(
        namespace,
        'Observer threw error',
        new Error('Observer timed out!')
      )
    })

    it('warns on same value set', async () => {
      const atom = getAtom()
      const value = { hey: 'ho' }
      await atom.set(value)
      await new Promise(setImmediate)

      await atom.set(value)
      await new Promise(setImmediate)
      expect(logger.warn).toHaveBeenCalledWith(
        namespace,
        `Atom was called with the same value it currently holds: ${JSON.stringify(value)}`
      )
    })
  })
})
