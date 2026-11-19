import type NumberUnitType from '../index.js'

const library = await import('../index.js')
const NumberUnit: typeof NumberUnitType = library.default // <--- NOTICE default

test('verify NumberUnit is exported', function () {
  expect.assertions(1)

  expect(typeof NumberUnit.create).toBe('function')
})
