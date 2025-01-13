import { bitcoin } from './_fixtures.js'
import NumberUnit from '../index.js'

test('number-unit: isNumberUnit()', function () {
  const b0 = bitcoin.ZERO
  expect(NumberUnit.isNumberUnit(b0)).toBeTruthy()
  expect(NumberUnit.isNumberUnit(34)).toBeFalsy()
})
