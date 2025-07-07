import createInMemoryStorage from '@exodus/storage-memory'

import createConnectedOriginsAtom from '../connected-origins.js'

describe('createConnectedOriginsAtom', () => {
  let storage
  beforeEach(() => {
    storage = createInMemoryStorage().namespace('connectedOrigins')
  })

  it('should update connected origins atoms', async () => {
    const connectedOriginsAtom = createConnectedOriginsAtom({ storage })
    const origins = [{ origin: 'exodus.com' }]

    await connectedOriginsAtom.set(origins)

    await expect(connectedOriginsAtom.get()).resolves.toEqual(origins)
  })

  it('should have proper deduping', async () => {
    const atom = createConnectedOriginsAtom({ storage })
    const origins = [{ origin: 'exodus.com' }]

    const handler = jest.fn()
    atom.observe(handler)

    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(1)

    await atom.set([...origins])
    await new Promise(setImmediate)

    expect(handler).toHaveBeenCalledTimes(2)

    await atom.set([...origins])
    await new Promise(setImmediate)

    expect(handler).toHaveBeenCalledTimes(2)

    await atom.set([{ origin: 'something.else' }])
    await new Promise(setImmediate)
    expect(handler).toHaveBeenCalledTimes(3)
  })
})
