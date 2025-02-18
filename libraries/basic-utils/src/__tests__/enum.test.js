import { createEnum } from '../index.js'

test('createEnum proxies defined values from underlying object', () => {
  expect(createEnum({ a: 1 }).a).toEqual(1)
})

test('createEnum throws on undefined keys', () => {
  expect(() => createEnum({ a: 1 }).b).toThrow(/enum key not found: b/)
})

test('createEnum is read-only', () => {
  expect(() => {
    createEnum({ a: 1 }).a = 2
  }).toThrow(/read-only/)
})
