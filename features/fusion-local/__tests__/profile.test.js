import fusionModule from '../module/index.js'
import createStorage from '@exodus/storage-memory'

let storage
let fusion

beforeEach(() => {
  storage = createStorage()
  fusion = fusionModule.factory({ storage })
})

describe('getProfile', () => {
  test('getProfile', async () => {
    const profile = await fusion.getProfile()
    expect(typeof profile).toBe('object')
    expect(profile).toHaveProperty('private')
    expect(typeof profile.private).toBe('object')
  })
})

describe('mergeProfile', () => {
  test('basic usage', async () => {
    const foo = Math.random()
    const bar = Math.random()
    await fusion.mergeProfile({ foo, private: { bar } })
    const profile = await fusion.getProfile()
    expect(profile.foo).toBe(foo)
    expect(profile.private.bar).toBe(bar)
  })

  test('object merging', async () => {
    const a = Math.random()
    const b = Math.random()
    await fusion.mergeProfile({ obj: { a } })
    await fusion.mergeProfile({ obj: { b } })
    const profile = await fusion.getProfile()
    expect(profile.obj.a).toBe(a)
    expect(profile.obj.b).toBe(b)
  })

  test('empty object replaces instead of merging', async () => {
    const a = Math.random()
    await fusion.mergeProfile({ emptyObj: { a }, private: { emptyObj: { a } } })
    await fusion.mergeProfile({ emptyObj: {}, private: { emptyObj: {} } })
    const profile = await fusion.getProfile()
    expect(profile.emptyObj).toEqual({})
    expect(profile.emptyObj).not.toHaveProperty('a')
    expect(profile.private.emptyObj).toEqual({})
    expect(profile.private.emptyObj).not.toHaveProperty('a')
  })

  test('no array merging', async () => {
    const a = Math.random()
    const b = Math.random()
    await fusion.mergeProfile({ arr: [a] })
    await fusion.mergeProfile({ arr: [b] })
    const profile = await fusion.getProfile()
    expect(profile.arr).toHaveLength(1)
    expect(profile.arr[0]).toBe(b)
  })
})

describe('clear', () => {
  test('resets atom', async () => {
    await fusion.mergeProfile({ private: { identity: 'Bruce Wayne' } })
    await fusion.clearStorage()

    await expect(storage.get('profile')).resolves.toBeUndefined()
    await expect(fusion.getProfile()).resolves.toEqual({ private: {} })
  })
})

describe('subscribe', () => {
  test('fires on changes', async () => {
    const foo = Math.random()
    const bar = Math.random()
    const cb = jest.fn((profile) => {
      expect(profile.foo).toBe(foo)
      expect(profile.private.bar).toBe(bar)
    })
    fusion.subscribe(cb)
    await fusion.mergeProfile({ foo, private: { bar } })
    expect(cb).toHaveBeenCalled()
  })
})
