import Address from '../address/index.js'

describe('Model ids', () => {
  let V1, V2
  let instance

  beforeEach(async () => {
    const V1Import = await import(`../address-set/index.js?version=v1`)
    const V2Import = await import(`../address-set/index.js?version=v2`)

    V1 = V1Import.default
    V2 = V2Import.default

    instance = new V1()
  })

  describe('isInstance', () => {
    it('returns true for same model and same import', async () => {
      expect(V1.isInstance(instance)).toBe(true)
    })

    it('returns true for same model and different imports', async () => {
      expect(V2.isInstance(instance)).toBe(true)
    })

    it('returns false for different models', async () => {
      expect(Address.isInstance(instance)).toBe(false)
    })
  })
})
