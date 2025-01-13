const NumberUnit = require('../').default // <--- NOTICE default

test('verify NumberUnit is exported', function() {
  expect.assertions(1)

  expect(typeof NumberUnit.create).toBe('function')
})
