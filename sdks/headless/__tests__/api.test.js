import createExodus from './exodus'

const createApi = (id, api) => ({ definition: { id: `${id}Api`, type: 'api', factory: () => api } })

describe('api', () => {
  test('merges same namespaces', async () => {
    const container = createExodus()
    container.register(createApi('otherAssets', { assets: { hail: () => 'hi from other assets' } }))
    container.register(
      createApi('yetAnotherAssets', {
        assets: { sayGoodbye: () => 'good bye from yet another assets' },
      })
    )

    const exodus = container.resolve()

    expect(exodus.assets.hail()).toBe('hi from other assets')
    expect(exodus.assets.sayGoodbye()).toBe('good bye from yet another assets')
  })

  test('throws when methods in namespace collide', async () => {
    const container = createExodus()
    container.register(createApi('otherAssets', { assets: { enable: () => {} } }))
    expect(() => container.resolve()).toThrow(
      'duplicate definition of API method "enable" in "assets"'
    )
  })
})
