import createInMemoryStorage from '@exodus/storage-memory'
import delay from 'delay'
import {
  createInMemoryAtom,
  createStorageAtomFactory,
  difference,
  swallowObserverErrors,
  timeoutObservers,
  warnOnSameValueSet,
} from '../src/index.js'

describe('enhancers', () => {
  test('difference', async () => {
    const defaultValue = [0]
    const intsAtom = createInMemoryAtom({
      defaultValue,
    })

    const intsDifferenceAtom = difference(intsAtom)
    const values = [[1], [2], [3]]
    const diffValues = values.map((current, i) => ({
      current,
      previous: i === 0 ? undefined : values[i - 1],
    }))

    const observe = async () =>
      new Promise<void>((resolve) => {
        const diffValuesCopy = [...diffValues]
        intsDifferenceAtom.observe((value) => {
          const expectedDiffValue = diffValuesCopy.shift()
          expect(value).toEqual(expectedDiffValue)
          if (diffValuesCopy.length === 0) resolve()
        })
      })

    const multiObservePromise = Promise.all([observe(), observe(), observe()])
    while (values.length > 0) {
      await intsAtom.set(values.shift()!)
    }

    await multiObservePromise
  })

  test('warnOnSameValueSet', async () => {
    const logger = { warn: jest.fn() }

    const value = { name: 'Harry Shmotter' }
    const atom = warnOnSameValueSet({
      atom: createInMemoryAtom(),
      logger: logger as never,
    })

    await atom.set(value)
    await atom.set(value)

    expect(logger.warn).toHaveBeenCalledWith(
      `Atom was called with the same value it currently holds: ${JSON.stringify(value)}`
    )

    await expect(atom.get()).resolves.toEqual(value)
  })

  test('swallowObserverErrors', async () => {
    const logger = { error: jest.fn() }
    const atom = swallowObserverErrors({
      atom: createInMemoryAtom(),
      logger: logger as never,
    })

    const error = new Error('boo!')
    atom.observe(() => {
      throw error
    })

    await atom.set('Harry Shames Shmotter')
    expect(logger.error).toHaveBeenCalledWith('Observer threw error', error)
  })

  test('swallowObserverErrors', async () => {
    const logger = { error: jest.fn() }
    const atom = swallowObserverErrors({
      atom: createInMemoryAtom(),
      logger: logger as never,
    })

    const error = new Error('boo!')
    atom.observe(() => {
      throw error
    })

    atom.set('Harry Shames Shmotter')
    await new Promise(setImmediate)
    expect(logger.error).toHaveBeenCalledWith('Observer threw error', error)
  })

  test('timeoutObservers', async () => {
    const logger = { error: jest.fn(), log: jest.fn() }
    // more intuitive but `observe` enhancers are applied in reverse order
    // const atom = swallowObserverErrors({
    //   atom: timeoutObservers({
    //     atom: createStorageAtomFactory({ storage: createInMemoryStorage(), logger })({
    //       key: 'voldie',
    //       isSoleWriter: true,
    //     }),
    //     timeout: 100,
    //   }),
    //   logger,
    // })

    const atom = timeoutObservers({
      atom: swallowObserverErrors({
        atom: createStorageAtomFactory({
          storage: createInMemoryStorage(),
        })({
          key: 'voldie',
          isSoleWriter: true,
        }),
        logger: logger as never,
      }),
      timeout: 20,
    })

    atom.observe(() => delay(1000))
    atom.set("don't wait up")
    await delay(100) // do NOT change this to 99!
    expect(logger.error).toHaveBeenCalledWith(
      'Observer threw error',
      new Error('Observer timed out!')
    )
  })
})
