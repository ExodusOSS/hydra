import { UnitType } from '../index.js'

const definitions = {
  satoshis: 0,
  bits: 2,
  BTC: 8,
}

const notUnitTypes = [34, '1 Bitcoin', {}, function noop() {}, () => {}]

describe('unit-type: instanceof', function () {
  let V1: typeof UnitType
  let V2: typeof UnitType
  // Indirected through a variable so TS doesn't statically resolve the
  // query-string suffix; distinct suffixes force fresh module copies on load.
  const path = '../unit-type.js'
  beforeEach(async () => {
    ;({ default: V1 } = (await import(`${path}?version=v1`)) as { default: typeof UnitType })
    ;({ default: V2 } = (await import(`${path}?version=v2`)) as { default: typeof UnitType })
  })

  it('returns true for same import', async () => {
    expect(V1.create(definitions) instanceof V1).toBe(true)
  })

  it('returns true for different imports', async () => {
    expect(V2.create(definitions) instanceof V1).toBe(true)
  })

  notUnitTypes.forEach((obj) => {
    it('should not be a UnitType instance', () => {
      expect(obj instanceof UnitType).toBeFalsy()
    })
  })
})
