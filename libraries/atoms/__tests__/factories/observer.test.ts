import type { Atom } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'
import type { Port } from '../../src/utils/types.js'
import createAtomObserver from '../../src/factories/observer.js'

describe('createAtomObserver', () => {
  const event = 'test'
  const data = { test: true }
  const falseData = { test: false }

  type SetupParams = {
    beforeObserverCreation?: (options: { port: Port<unknown>; atom: Atom<unknown> }) => void
    immediateRegister?: boolean
  }

  const setup = ({ beforeObserverCreation, immediateRegister }: SetupParams = {}) => {
    const port = { emit: jest.fn() }
    const atom = createInMemoryAtom<typeof data>({ defaultValue: data })
    beforeObserverCreation?.({ port, atom })

    const observer = createAtomObserver<typeof data>({ port, atom, event, immediateRegister })

    return { port, atom, observer }
  }

  it('should register on creation', () => {
    const { atom } = setup({
      beforeObserverCreation: ({ atom }) => {
        jest.spyOn(atom, 'observe')
      },
    })

    expect(atom.observe).toHaveBeenCalled()
  })

  it('should not register when explicitly disabled while creating', () => {
    const { atom } = setup({
      beforeObserverCreation: ({ atom }) => {
        jest.spyOn(atom, 'observe')
      },
      immediateRegister: false,
    })

    expect(atom.observe).not.toHaveBeenCalled()
  })

  it('should only observe once when calling register multiple times', () => {
    const { atom, observer } = setup({
      beforeObserverCreation: ({ atom }) => {
        jest.spyOn(atom, 'observe')
      },
    })

    observer.register()

    expect(atom.observe).toHaveBeenCalledTimes(1)
  })

  it('should be silent when not observing', () => {
    const { port, atom } = setup()

    atom.set({ test: false })

    expect(port.emit).not.toHaveBeenCalled()
  })

  it('should immeadiatly emit when starting observing', async () => {
    const { port, observer } = setup()

    await observer.start()

    expect(port.emit).toHaveBeenCalledWith(event, data)
  })

  it('should emit when observing', async () => {
    const { port, atom, observer } = setup()
    const newData = { test: false }

    await observer.start()
    await atom.set(newData)

    expect(port.emit).toHaveBeenCalledWith(event, newData)
  })

  it('should reject observe start when atom has issues', async () => {
    const error = new Error('Error getting data')

    const { observer } = setup({
      beforeObserverCreation: ({ atom }) => {
        jest.spyOn(atom, 'get').mockRejectedValueOnce(error)
      },
      immediateRegister: false,
    })

    await expect(observer.start()).rejects.toEqual(error)
  })

  it('should make it possible to stop observing', async () => {
    const { port, atom, observer } = setup()
    const newData = { test: false }

    await observer.start()
    observer.unregister()
    await atom.set(newData)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(port.emit).not.toHaveBeenCalledWith(event, newData)
  })

  it('should not crash when unregsitering before it is available', () => {
    const { observer } = setup({
      immediateRegister: false,
    })

    expect(() => observer.unregister()).not.toThrow()
  })

  it('should skip start emit if it happens after observe emit', async () => {
    const { atom, port, observer } = setup()

    const startPromise = observer.start()
    atom.set(falseData)
    await startPromise

    expect(port.emit).toHaveBeenCalledTimes(1)
    expect(port.emit).toHaveBeenCalledWith(event, falseData)
  })
})
