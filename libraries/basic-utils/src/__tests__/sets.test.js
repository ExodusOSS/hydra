import { areSetsEqual } from '../sets.js'

describe('areSetsEqual', () => {
  test('identical sets are equal', () => {
    expect(areSetsEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true)
  })

  test('sets with different insertion order are equal', () => {
    expect(areSetsEqual(new Set([1, 2, 3]), new Set([3, 2, 1]))).toBe(true)
  })

  test('sets with different numbers of elements are not equal', () => {
    expect(areSetsEqual(new Set([1, 2, 3]), new Set([3]))).toBe(false)
  })

  test('sets are compared with shallow equality', () => {
    expect(areSetsEqual(new Set([{}]), new Set([{}]))).toBe(false)
  })
})
