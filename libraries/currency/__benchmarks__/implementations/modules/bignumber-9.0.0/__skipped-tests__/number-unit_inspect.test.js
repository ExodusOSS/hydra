import { inspect } from 'util'
import { bitcoin } from './_fixtures'

test.skip('inspect()', function() {
  let b1 = bitcoin.BTC(1.53)
  let i = inspect(b1)
  expect(i).toEqual('<NumberUnit: 1.53 BTC >')
})
