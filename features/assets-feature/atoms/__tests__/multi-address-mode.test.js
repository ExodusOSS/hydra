import fusionLocalDefinition from '@exodus/fusion-local/module'
import createInMemoryStorage from '@exodus/storage-memory'

import multiAddressModeAtomDefinition from '../multi-address-mode.js'

const createMultiAddressModeAtom = multiAddressModeAtomDefinition.factory
const createFusionLocal = fusionLocalDefinition.factory

const logger = { log: jest.fn() }

describe('multi address mode atom', () => {
  let storage
  let fusion
  let multiAddressModeAtom

  beforeEach(() => {
    storage = createInMemoryStorage()
    fusion = createFusionLocal({ storage })
    multiAddressModeAtom = createMultiAddressModeAtom({ storage, fusion, logger, config: {} })
  })

  it('should get empty object by default', async () => {
    await expect(multiAddressModeAtom.get()).resolves.toEqual({})
  })

  it('should set non-bitcoin assets in storage', async () => {
    const value = { ethereum: true, litecoin: false, bitcoin: false, monero: false }
    await multiAddressModeAtom.set(value)

    await expect(multiAddressModeAtom.get()).resolves.toEqual(value)
    await expect(storage.get('multiAddressMode')).resolves.toEqual({
      ethereum: true,
      litecoin: false,
    })
  })

  it('should set bitcoin asset in fusion', async () => {
    const value = { bitcoin: true, monero: false }
    await multiAddressModeAtom.set(value)

    await expect(multiAddressModeAtom.get()).resolves.toEqual(value)
    await expect(storage.get('multiAddressMode')).resolves.toEqual({})
    await expect(fusion.getProfile()).resolves.toMatchObject({ enableMultipleAddresses: true })
  })

  it('should set monero asset in fusion', async () => {
    const value = { bitcoin: false, monero: true }
    await multiAddressModeAtom.set(value)

    await expect(multiAddressModeAtom.get()).resolves.toEqual(value)
    await expect(storage.get('multiAddressMode')).resolves.toEqual({})
    await expect(fusion.getProfile()).resolves.toMatchObject({ moneroSubaddressesEnabled: true })
  })

  it('should set all assets', async () => {
    const value = { bitcoin: false, monero: true, ethereum: true }
    await multiAddressModeAtom.set(value)

    await expect(multiAddressModeAtom.get()).resolves.toEqual(value)
    await expect(storage.get('multiAddressMode')).resolves.toEqual({ ethereum: true })
    await expect(fusion.getProfile()).resolves.toMatchObject({
      enableMultipleAddresses: false,
      moneroSubaddressesEnabled: true,
    })
  })

  it('should set pasing function', async () => {
    const value = { bitcoin: false, monero: false, ethereum: true }
    await multiAddressModeAtom.set(value)

    await multiAddressModeAtom.set((value) => ({ ...value, ethereum: false }))

    await expect(multiAddressModeAtom.get()).resolves.toEqual({
      bitcoin: false,
      ethereum: false,
      monero: false,
    })
    await expect(storage.get('multiAddressMode')).resolves.toEqual({ ethereum: false })
    await expect(fusion.getProfile()).resolves.toMatchObject({
      enableMultipleAddresses: false,
      moneroSubaddressesEnabled: false,
    })
  })

  it('should observe when non-bitcoin assets are set', async () => {
    const listener = jest.fn()
    multiAddressModeAtom.observe(listener)
    await multiAddressModeAtom.set({ ethereum: true })
    expect(listener).toHaveBeenCalledWith({ bitcoin: false, monero: false, ethereum: true })
  })

  it('should observe when bitcoin asset are set', async () => {
    const listener = jest.fn()
    multiAddressModeAtom.observe(listener)
    await multiAddressModeAtom.set({ bitcoin: true, monero: false })
    expect(listener).toHaveBeenCalledWith({ bitcoin: true, monero: false })
  })

  it('should observe when bitcoin asset change in fusion', async () => {
    const listener = jest.fn()
    multiAddressModeAtom.observe(listener)
    await fusion.mergeProfile({ enableMultipleAddresses: true })
    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledWith({ bitcoin: true })
  })

  it('should observe when monero asset are set', async () => {
    const listener = jest.fn()
    multiAddressModeAtom.observe(listener)
    await multiAddressModeAtom.set({ bitcoin: false, monero: true })
    expect(listener).toHaveBeenCalledWith({ bitcoin: false, monero: true })
  })

  it('should observe when bitcoin asset change in fusion', async () => {
    const listener = jest.fn()
    multiAddressModeAtom.observe(listener)
    await fusion.mergeProfile({ moneroSubaddressesEnabled: true })
    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledWith({ monero: true })
  })
})
