import memoize from '../memoize.js'

const fn = async ({ param }) => {
  await new Promise((resolve) => setTimeout(resolve, 0))

  // Returns an object to compare references
  return { result: `Result for parameter: ${param}` }
}

describe('memoize', () => {
  it('should memoize function without resolver', async () => {
    let calls = 0
    const doubleFn = (number) => {
      calls++
      return number * 2
    }

    const memoizedFunction = memoize(doubleFn)

    const result1 = memoizedFunction(1)
    const result2 = memoizedFunction(2)
    const result3 = memoizedFunction(1)

    expect(result1).toBe(2)
    expect(result2).toBe(4)
    expect(result1).toBe(result3)
    expect(calls).toBe(2)
  })

  it('should memoize function as lodash does', async () => {
    const memoizedFunction = memoize(fn, ({ param }) => param)

    const result1 = await memoizedFunction({ param: 'abc' })
    const result2 = await memoizedFunction({ param: 'cde' })
    const result3 = await memoizedFunction({ param: 'abc' })

    expect(result1).toEqual({ result: 'Result for parameter: abc' }) // make sure the result value is the same.
    expect(result2).toEqual({ result: 'Result for parameter: cde' })
    expect(result1).toBe(result3) // make sure the result is memoized and the reference is the same.

    await new Promise((resolve) => setTimeout(resolve, 100))

    const result4 = await memoizedFunction({ param: 'abc' }) // make sure reference is the same
    expect(result4).toBe(result3)
  })

  it('should memoize function only for some time', async () => {
    const memoizedFunction = memoize(fn, ({ param }) => param, 100)

    const result1 = await memoizedFunction({ param: 'abc' })
    const result2 = await memoizedFunction({ param: 'cde' })
    const result3 = await memoizedFunction({ param: 'abc' })

    expect(result1).toEqual({ result: 'Result for parameter: abc' })
    expect(result2).toEqual({ result: 'Result for parameter: cde' })
    expect(result1).toBe(result3)

    await new Promise((resolve) => setTimeout(resolve, 200))

    const result4 = await memoizedFunction({ param: 'abc' })
    expect(result4).not.toBe(result1)
    expect(result4).toEqual(result1)
  })
})
