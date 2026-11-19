if (process.env.CI === 'true' && process.env.CI_ENABLE_VERBOSE_LOGS !== 'true') {
  console.log = () => {}
  console.debug = () => {}
  console.warn = () => {}
}

// @exodus/currency brands its classes with these static keys so that `instanceof`
// keeps working across duplicated copies of the package. Structural equality does not:
// `Unit` is a closure, so two copies never produce reference-equal `unit`/`unitType`
// members and `toEqual`/`toMatchObject`/`toHaveBeenCalledWith` fail with
// "serializes to the same string". Compare the serialized form instead.
const CURRENCY_BRAND_KEYS = ['Exodus:CurrencyId', 'Exodus:UnitTypeId']

const currencyBrandOf = (value) => {
  if (value === null || typeof value !== 'object' || Object.hasOwn(value, 'constructor')) return
  const { constructor } = value
  if (!constructor || typeof value.toJSON !== 'function') return
  const key = CURRENCY_BRAND_KEYS.find((brandKey) => constructor[brandKey])
  return key && `${key}:${constructor[key]}`
}

expect.addEqualityTesters([
  function currencyEquality(a, b) {
    const brand = currencyBrandOf(a)
    if (!brand || brand !== currencyBrandOf(b)) return

    return this.equals(a.toJSON(), b.toJSON())
  },
])
