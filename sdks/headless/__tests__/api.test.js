import createExodus from './exodus.js'

const createApi = (id, api) => ({ definition: { id: `${id}Api`, type: 'api', factory: () => api } })

describe('api', () => {
  test('merges same namespaces', async () => {
    const container = createExodus()
    container.register(
      createApi('otherAssets', { assets: { hail: async () => 'hi from other assets' } })
    )
    container.register(
      createApi('yetAnotherAssets', {
        assets: { sayGoodbye: async () => 'good bye from yet another assets' },
      })
    )

    const exodus = container.resolve()

    await expect(exodus.assets.hail()).resolves.toBe('hi from other assets')
    await expect(exodus.assets.sayGoodbye()).resolves.toBe('good bye from yet another assets')
  })

  test('promisifies return value', async () => {
    const container = createExodus()
    container.register(createApi('batman', { batman: { getIdentity: () => 'Bruce Wayne' } }))
    const exodus = container.resolve()

    const returnValue = exodus.batman.getIdentity()

    expect(returnValue).toBeInstanceOf(Promise)
    await expect(returnValue).resolves.toBe('Bruce Wayne')
  })

  test('throws when methods in namespace collide', async () => {
    const container = createExodus()
    container.register(createApi('otherAssets', { assets: { enable: () => {} } }))
    expect(() => container.resolve()).toThrow(
      'duplicate definition of API method "enable" in "assets"'
    )
  })
})
