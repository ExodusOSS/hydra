import NumberUnit, { UnitType } from '../index.js'

const path = '../number-unit.js'

const btcUnit = UnitType.create({
  satoshis: 0,
  bits: 2,
  BTC: 8,
})
const notNumberUnits = [34, '1 Bitcoin', {}, btcUnit, function noop() {}, () => {}]

describe('number-unit: instanceof', function () {
  let V1, V2
  beforeEach(async () => {
    ;({ default: V1 } = await import(`${path}?version=v1`))
    ;({ default: V2 } = await import(`${path}?version=v2`))
  })

  it('returns true for same import', async () => {
    expect(new V1(1, btcUnit.BTC) instanceof V1).toBe(true)
  })

  it('returns true for different imports', async () => {
    expect(new V2(1, btcUnit.BTC) instanceof V1).toBe(true)
  })

  notNumberUnits.forEach((obj) => {
    it('should not be a NumberUnit instance', () => {
      expect(obj instanceof NumberUnit).toBeFalsy()
    })
  })
})
