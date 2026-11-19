import Wrapper from '../native-bigint.js'

// allow: heterogeneous fixtures driving Wrapper's runtime instanceof check; generic <T> rejected (the whole point is to assert non-membership for arbitrary unrelated types)
const notWrappers: unknown[] = [34, '1', {}, function noop() {}, () => {}, 5n]

describe('native-bigint: instanceof', function () {
  let V1: typeof Wrapper
  let V2: typeof Wrapper
  beforeEach(async () => {
    ;({ default: V1 } = await import(`../native-bigint.js?version=v1`))
    ;({ default: V2 } = await import(`../native-bigint.js?version=v2`))
  })

  it('returns true for same import', () => {
    expect(V1.wrap(1) instanceof V1).toBe(true)
  })

  it('returns true for different imports', () => {
    expect(V2.wrap(1) instanceof V1).toBe(true)
  })

  notWrappers.forEach((obj, index) => {
    it(`should not be a Wrapper instance [${index}]: ${typeof obj}`, () => {
      expect(obj instanceof Wrapper).toBeFalsy()
    })
  })
})
