import combine from '../../src/enhancers/combine.js'
import type { Atom, ReadonlyAtom, Unsubscribe } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'

describe('combine', () => {
  let nameAtom: Atom<string>
  let occupationAtom: Atom<string>
  let nameAndOccupationAtom: ReadonlyAtom<{ name: string; occupation: string }>
  let observer: jest.Mock
  let unsubscribe: Unsubscribe

  beforeEach(() => {
    nameAtom = createInMemoryAtom()
    occupationAtom = createInMemoryAtom()
    nameAndOccupationAtom = combine({ name: nameAtom, occupation: occupationAtom })
    observer = jest.fn()
    unsubscribe = nameAndOccupationAtom.observe(observer)
  })

  it('should NOT emit unless all atoms have emitted', async () => {
    await nameAtom.set('Bob')
    expect(observer).not.toHaveBeenCalled()
  })

  it('should emit when all of the combined atoms have emitted at least once', async () => {
    await nameAtom.set('Bob')
    await occupationAtom.set('Farmer')

    expect(await nameAndOccupationAtom.get()).toEqual({ name: 'Bob', occupation: 'Farmer' })
    expect(observer).toHaveBeenCalledWith({ name: 'Bob', occupation: 'Farmer' })
    expect(observer).toHaveBeenCalledTimes(1)
  })

  it('should emit when ANY atom emits after all atoms emitted at least once', async () => {
    await nameAtom.set('Bob')
    await occupationAtom.set('Farmer')

    observer.mockReset()

    await nameAtom.set('Fred Flintstone')
    expect(await nameAndOccupationAtom.get()).toEqual({
      name: 'Fred Flintstone',
      occupation: 'Farmer',
    })

    expect(observer).toHaveBeenCalledWith({ name: 'Fred Flintstone', occupation: 'Farmer' })
  })

  it('should not mutate result', async () => {
    await nameAtom.set('Bob')
    await occupationAtom.set('Farmer')
    const result1 = await nameAndOccupationAtom.get()

    observer.mockReset()

    await nameAtom.set('Fred Flintstone')
    const result2 = await nameAndOccupationAtom.get()
    expect(result2).toEqual({
      name: 'Fred Flintstone',
      occupation: 'Farmer',
    })
    expect(result1.name).toEqual('Bob')

    expect(observer).toHaveBeenCalledWith({ name: 'Fred Flintstone', occupation: 'Farmer' })
  })

  it('should unsubscribe from source atoms when no observer left', async () => {
    const unsubscribeNameAtom = jest.fn()
    const unsubscribeOccupationAtom = jest.fn()

    const nameAtom = {
      observe: () => unsubscribeNameAtom,
      get: jest.fn(),
      set: jest.fn(),
      reset: jest.fn(),
    }

    const occupationAtom = {
      observe: () => unsubscribeOccupationAtom,
      get: jest.fn(),
      set: jest.fn(),
      reset: jest.fn(),
    }

    const combined = combine({ name: nameAtom, occupation: occupationAtom })

    const unsubObs1 = combined.observe(jest.fn())
    const unsubObs2 = combined.observe(jest.fn())

    unsubObs1()
    expect(unsubscribeNameAtom).not.toHaveBeenCalled()
    expect(unsubscribeOccupationAtom).not.toHaveBeenCalled()

    unsubObs2()
    expect(unsubscribeNameAtom).toHaveBeenCalled()
    expect(unsubscribeOccupationAtom).toHaveBeenCalled()
  })

  it('should resubscribe once unsubscribed from source', async () => {
    await nameAtom.set('Bob')
    await occupationAtom.set('Farmer')

    unsubscribe()

    const handler = jest.fn()
    nameAndOccupationAtom.observe(handler)

    expect(observer).toHaveBeenCalledWith({ name: 'Bob', occupation: 'Farmer' })
    expect(observer).toHaveBeenCalledTimes(1)
  })

  it('should be able to call get on combined atom without observers', async () => {
    const nameAtom = createInMemoryAtom({ defaultValue: 'Bruce Wayne' })
    const occupationAtom = createInMemoryAtom({ defaultValue: 'Batman' })

    const combined = combine({ name: nameAtom, occupation: occupationAtom })

    await expect(combined.get()).resolves.toEqual({ name: 'Bruce Wayne', occupation: 'Batman' })
  })
})
