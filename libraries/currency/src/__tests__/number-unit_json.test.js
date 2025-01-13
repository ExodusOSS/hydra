import { bitcoin } from './_fixtures.js'

test('JSON stringify should not throw an error', function () {
  const b1 = bitcoin.BTC(1.53)
  const json = JSON.stringify(b1)
  expect(json).toBeTruthy()
})

test('toJSON()', function () {
  const b1 = bitcoin.BTC('-1.53')

  const json = b1.toJSON()

  expect(json).toEqual({
    value: '-1.53',
    unit: 'BTC',
    unitType: 'BTC',
    type: 'NumberUnit',
  })
})
