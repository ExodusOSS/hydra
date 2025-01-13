import createDeferringStorage, { DeferringStorage } from '../src/storage.js'
import { Storage } from '@exodus/storage-interface'

describe('DeferringStorage', () => {
  let deferringStorage: ReturnType<typeof createDeferringStorage>
  let storage: Storage

  beforeEach(() => {
    storage = {
      get: jest.fn(),
      set: jest.fn(),
      batchGet: jest.fn(),
      batchSet: jest.fn(),
      clear: jest.fn(),
      delete: jest.fn(),
      namespace: jest.fn(),
    } as never

    deferringStorage = createDeferringStorage(storage)
  })

  test('defers {get,batchGet,set,batchSet} until release()', async () => {
    deferringStorage.get('theKey')
    deferringStorage.set('theKey', 'abc')
    deferringStorage.batchGet(['theKey', 'theOtherKey'])
    deferringStorage.batchSet({ theKey: 'abc' })
    await new Promise(setImmediate)

    expect(storage.get).not.toHaveBeenCalled()
    expect(storage.set).not.toHaveBeenCalled()
    expect(storage.batchGet).not.toHaveBeenCalled()
    expect(storage.batchSet).not.toHaveBeenCalled()

    deferringStorage.release()
    await new Promise(setImmediate)

    expect(storage.get).toHaveBeenCalledWith('theKey')
    expect(storage.batchGet).toHaveBeenCalledWith(['theKey', 'theOtherKey'])
    expect(storage.set).toHaveBeenCalledWith('theKey', 'abc')
    expect(storage.batchSet).toHaveBeenCalledWith({ theKey: 'abc' })
  })

  test('does not defer clearing', async () => {
    deferringStorage.clear()
    await new Promise(setImmediate)

    expect(storage.clear).toHaveBeenCalled()
  })

  test('does not defer setting an undefined value', async () => {
    deferringStorage.set('theKeyToRuleThemAll', undefined)
    await new Promise(setImmediate)

    expect(storage.set).toHaveBeenCalledWith('theKeyToRuleThemAll', undefined)
  })

  test('does not defer deleting', async () => {
    deferringStorage.delete('abc')
    await new Promise(setImmediate)

    expect(storage.delete).toHaveBeenCalledWith('abc')
  })

  test('allows namespacing', () => {
    const namespaced = deferringStorage.namespace('abc')
    expect(namespaced).toBeInstanceOf(DeferringStorage)
  })
})
