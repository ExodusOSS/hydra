import optimisticNotifier from '../../src/enhancers/optimistic-notifier.js'
import type { Atom } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'

describe('optimisticNotifier enhancer', () => {
  let identityAtom: Atom<string>

  beforeEach(() => {
    identityAtom = createInMemoryAtom()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should notify right away', async () => {
    identityAtom.set = jest.fn(() => new Promise(() => {}))
    const atom = optimisticNotifier(identityAtom)

    const handler = jest.fn()
    atom.observe(handler)

    void atom.set('Batman')

    await expect(atom.get()).resolves.toBe('Batman')
    expect(handler).toHaveBeenCalledWith('Batman')
    expect(identityAtom.set).toHaveBeenCalledWith('Batman')
  })

  it('should update when source atom receives update', async () => {
    const atom = optimisticNotifier(identityAtom)
    await atom.set('Batman')

    const handler = jest.fn()
    atom.observe(handler)

    await identityAtom.set('Harvey Dent')

    await expect(atom.get()).resolves.toBe('Harvey Dent')
    expect(handler).toHaveBeenCalledWith('Harvey Dent')
  })

  it('should not call set on source atom when it updates', async () => {
    const atom = optimisticNotifier(identityAtom)
    await atom.set('Batman')

    const handler = jest.fn()
    atom.observe(handler)

    await identityAtom.set('Harvey Dent')

    // begin spying
    const setSpy = jest.spyOn(identityAtom, 'set')
    // wait for event loop to clear
    await new Promise(setImmediate)

    expect(setSpy).not.toHaveBeenCalled()

    await expect(atom.get()).resolves.toBe('Harvey Dent')
    expect(handler).toHaveBeenCalledWith('Harvey Dent')
  })

  it('should revert to previous value if set fails', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const atom = optimisticNotifier(identityAtom)
    atom.observe(jest.fn())

    await atom.set('Batman')

    await expect(atom.get()).resolves.toBe('Batman')

    identityAtom.set = () =>
      new Promise((resolve, reject) => {
        setTimeout(reject, 100)
      })

    void atom.set('Harvey Dent')

    await advance(50)
    await expect(atom.get()).resolves.toBe('Harvey Dent')

    await advance(51)
    await expect(atom.get()).resolves.toBe('Batman')
  })

  it('should not revert if subsequent write succeeds', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })

    const atom = optimisticNotifier(identityAtom)
    atom.observe(jest.fn())

    await atom.set('Batman')

    await expect(atom.get()).resolves.toBe('Batman')

    identityAtom.set = () =>
      new Promise((resolve, reject) => {
        setTimeout(reject, 100)
      })

    await atom.set('Harvey Dent')

    await advance(50)
    await expect(atom.get()).resolves.toBe('Harvey Dent')

    identityAtom.set = jest.fn().mockResolvedValue(undefined)

    await atom.set('Rudolf')
    await advance(51)
    await expect(atom.get()).resolves.toBe('Rudolf')
  })

  it('should get value when no observer', async () => {
    const atom = optimisticNotifier(identityAtom)

    await identityAtom.set('Batman')
    await expect(atom.get()).resolves.toBe('Batman')

    await identityAtom.set('Rudolf')
    await expect(atom.get()).resolves.toBe('Rudolf')
  })

  it('should get updated value after unsubscribe', async () => {
    const atom = optimisticNotifier(identityAtom)
    const unsubscribe = atom.observe(jest.fn())

    await identityAtom.set('Batman')
    await expect(atom.get()).resolves.toBe('Batman')

    unsubscribe()

    await identityAtom.set('Rudolf')
    await expect(atom.get()).resolves.toBe('Rudolf')
  })

  it('should unsubscribe from source when no observer left', async () => {
    const unsubscribeSource = jest.fn()

    identityAtom.observe = () => unsubscribeSource

    const atom = optimisticNotifier(identityAtom)

    const unsubObs1 = atom.observe(jest.fn())
    const unsubObs2 = atom.observe(jest.fn())

    unsubObs1()
    expect(unsubscribeSource).not.toHaveBeenCalled()

    unsubObs2()
    expect(unsubscribeSource).toHaveBeenCalled()
  })

  it('should resubscribe when observed again', async () => {
    const atom = optimisticNotifier(identityAtom)
    await atom.set('Batman')

    const unsubscribe = atom.observe(jest.fn())
    unsubscribe()

    const value = await new Promise((resolve) => atom.observe(resolve))

    expect(value).toBe('Batman')
  })

  const advance = async (ms: number) => {
    await new Promise(setImmediate)
    jest.advanceTimersByTime(ms)
    await new Promise(setImmediate)
  }
})
