import UnitType from '../unit-type.js'

test('equals() to be true when same instance', function () {
  const bitcoin = UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  })
  expect(bitcoin.equals(bitcoin)).toEqual(true)
})

test('equals() to raise when not unit type', function () {
  const bitcoin = UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  })
  expect(() => bitcoin.equals(123)).toThrow('argument must be a UnitType')
})

test('equals() to be true when created with same data', function () {
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  })
  const bitcoin2 = UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(true)
  expect(bitcoin1 === bitcoin2).toBeTruthy()
})

test('equals() to be true when created with same data different order', function () {
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    bits: 2,
    BTC: 8,
  })
  const bitcoin2 = UnitType.create({
    BTC: 8,
    bits: 2,
    satoshis: 0,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(true)
  expect(bitcoin1 === bitcoin2).toBeTruthy()
})

test('equals() to be false when missing unit -- THIS SHOULD FAIL', function () {
  const bitcoin1 = UnitType.create({
    BTC: 8,
    satoshis: 0,
  })
  const bitcoin2 = UnitType.create({
    BTC: 8,
    bits: 2,
    satoshis: 0,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(true)
})

test('equals() to be false when different default unit power -- THIS SHOULD FAIL', function () {
  const bitcoin1 = UnitType.create({
    BTC: 10, // default unit
    satoshis: 0,
  })
  const bitcoin2 = UnitType.create({
    BTC: 8, // default unit
    bits: 2,
    satoshis: 0,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(true)
})

test('equals() to be false when different default unit name', function () {
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    bits: 2, // default unit
  })
  const bitcoin2 = UnitType.create({
    BTC: 8, // default unit
    bits: 2,
    satoshis: 0,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(false)
})

test('equals() to be true when all units match', function () {
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    BTC1: 8, // alias
    BTC2: 8, // default unit
  })
  const bitcoin2 = UnitType.create({
    satoshis: 0,
    BTC1: 8, // alias
    BTC2: 8, // default unit
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(true)
  expect(bitcoin1 === bitcoin2).toBeTruthy()
})

test('equals() to be false when different default unit name', function () {
  // when using aliases, ordering matters!
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    BTC2: 8, // alias
    BTC3: 8, // default unit
  })
  const bitcoin2 = UnitType.create({
    BTC3: 8, // alias
    BTC2: 8, // default unit
    satoshis: 0,
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(false)
})

test('equals() to be false when different default unit name', function () {
  const bitcoin1 = UnitType.create({
    satoshis: 0,
    BTC3: 8, // alias
    BTC4: 8, // default unit
  })
  const bitcoin2 = UnitType.create({
    satoshis: 0,
    BTC4: 8, // alias
    BTC3: 8, // default unit
  })
  expect(bitcoin1.equals(bitcoin2)).toEqual(false)
})
