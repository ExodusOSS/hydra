import { createFusionAtom } from '../index.js'

describe('createFusionAtom', () => {
  let fusion
  let logger

  beforeEach(() => {
    logger = {
      log: () => null,
    }

    fusion = {
      mergeProfile: jest.fn(),
      getProfile: jest.fn(),
      subscribe: jest.fn(),
    }
  })

  it('should set value at specified path', async () => {
    const setSpy = jest.spyOn(fusion, 'mergeProfile')
    const fusionAtom = createFusionAtom({ fusion, logger, path: 'test.path', defaultValue: null })
    await fusionAtom.set('testValue')
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({ test: { path: 'testValue' } }))
  })

  it('should get value from profile', async () => {
    fusion.getProfile.mockResolvedValueOnce({ test: { path: 'testValue' } })
    const fusionAtom = createFusionAtom({ fusion, logger, path: 'test.path', defaultValue: null })
    const value = await fusionAtom.get()
    expect(value).toEqual('testValue')
  })

  it('should not call listener if newValue equals prev and called is true', async () => {
    const listener = jest.fn()
    const listener2 = jest.fn()
    const profile = { test: { path: 'testValue' } }
    const profileUndefined = { test: { path: undefined } }

    const subscriptions = []
    fusion.subscribe.mockImplementation((subscription) => {
      subscriptions.push(subscription)
    })

    const fusionAtom = createFusionAtom({
      fusion,
      logger,
      path: 'test.path',
    })
    fusionAtom.set('initialValue')

    fusionAtom.observe(listener)
    fusionAtom.observe(listener2)

    // should emit new "undefined" value, different than previous
    for (const subscription of subscriptions) {
      subscription(profileUndefined)
    }

    for (const subscription of subscriptions) {
      subscription(profile)
    }

    // Call wrapper twice with the same profile to test the newValue === prev case
    for (const subscription of subscriptions) {
      subscription(profile)
    }

    // Call wrapper with new object, but same prop on path
    for (const subscription of subscriptions) {
      subscription({ ...profile })
    }

    // Call wrapper with new object, but different prop on path
    for (const subscription of subscriptions) {
      subscription({ test: { path: 'testValue2' } })
    }

    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener.mock.calls[0][0]).toEqual(undefined)
    expect(listener.mock.calls[1][0]).toEqual('testValue')
    expect(listener.mock.calls[2][0]).toEqual('testValue2')
    expect(listener2).toHaveBeenCalledTimes(3)
    expect(listener2.mock.calls[0][0]).toEqual(undefined)
    expect(listener2.mock.calls[1][0]).toEqual('testValue')
    expect(listener2.mock.calls[2][0]).toEqual('testValue2')
  })

  it('should not call listener if newValue equals prev and called is true and value is an object', async () => {
    const listener = jest.fn()
    const profile = { test: { path: { foo: 'bar' } } }

    fusion.subscribe.mockImplementationOnce((wrapper) => {
      wrapper(profile)
      wrapper(profile) // Call wrapper twice with the same profile to test the newValue === prev case
      wrapper({ ...profile }) // Call wrapper with new object, but same prop on path
      wrapper({ test: { path: { foo: 'bar2' } } }) // Call wrapper with new object, but different prop on path
    })

    const fusionAtom = createFusionAtom({ fusion, logger, path: 'test.path', defaultValue: null })
    fusionAtom.observe(listener)

    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener.mock.calls[0][0]).toEqual({ foo: 'bar' })
    expect(listener.mock.calls[1][0]).toEqual({ foo: 'bar2' })
  })
})
