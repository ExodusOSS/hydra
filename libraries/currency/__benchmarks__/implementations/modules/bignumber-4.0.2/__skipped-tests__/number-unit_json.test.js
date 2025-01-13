import { bitcoin } from './_fixtures'

test('JSON stringify should not throw an error', function() {
  let b1 = bitcoin.BTC(1.53)
  let json = JSON.stringify(b1)
  expect(json).toBeTruthy()
})

test('toJSON()', function() {
  let b1 = bitcoin.BTC('-1.53')

  let json = b1.toJSON()

  expect(json).toEqual({
    value: '-1.53',
    unit: 'BTC',
    unitType: 'BTC',
    type: 'NumberUnit',
  })
})
