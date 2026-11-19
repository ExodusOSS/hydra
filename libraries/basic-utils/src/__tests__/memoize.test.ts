import memoize from '../memoize.js'

interface FnParam {
  param: string
}

interface FnResult {
  result: string
}

const fn = async ({ param }: FnParam): Promise<FnResult> => {
  await new Promise((resolve) => setTimeout(resolve, 0))

  // Returns an object to compare references
  return { result: `Result for parameter: ${param}` }
}

describe('memoize', () => {
  it('should memoize function without resolver', async () => {
    let calls = 0
    const doubleFn = (number: number): number => {
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

  it('should allow clearing cache', async () => {
    let count = 0
    const fn = jest.fn(() => ++count)
    const memoizedFn = memoize(fn)

    const first = memoizedFn()
    memoizedFn.reset()
    const second = memoizedFn()

    expect(first).toBe(1)
    expect(second).toBe(2)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should memoize function as lodash does', async () => {
    const memoizedFunction = memoize(fn, ({ param }: FnParam) => param)

    const result1 = await memoizedFunction({ param: 'abc' })
    const result2 = await memoizedFunction({ param: 'cde' })
    const result3 = await memoizedFunction({ param: 'abc' })

    expect(result1).toEqual({ result: 'Result for parameter: abc' }) // make sure the result value is the same.
    expect(result2).toEqual({ result: 'Result for parameter: cde' })
    expect(result1).toBe(result3) // make sure the result is memoized and the reference is the same.

    await new Promise((resolve) => setTimeout(resolve, 0))

    const result4 = await memoizedFunction({ param: 'abc' }) // make sure reference is the same
    expect(result4).toBe(result3)
  })

  it('should memoize function only for some time', async () => {
    // memoize expires entries off Date.now(); fake timers freeze it so the three
    // awaited calls below all land inside the 20ms TTL regardless of how long the
    // real-time gaps take on a loaded runner. setTimeout stays real so the inner
    // `await setTimeout(0)` in `fn` still resolves.
    jest.useFakeTimers({ doNotFake: ['setTimeout'] })

    try {
      const memoizedFunction = memoize(fn, ({ param }: FnParam) => param, 20)

      const result1 = await memoizedFunction({ param: 'abc' })
      const result2 = await memoizedFunction({ param: 'cde' })
      const result3 = await memoizedFunction({ param: 'abc' })

      expect(result1).toEqual({ result: 'Result for parameter: abc' })
      expect(result2).toEqual({ result: 'Result for parameter: cde' })
      expect(result1).toBe(result3)

      jest.advanceTimersByTime(60) // advance past the 20ms TTL

      const result4 = await memoizedFunction({ param: 'abc' })
      expect(result4).not.toBe(result1)
      expect(result4).toEqual(result1)
    } finally {
      jest.useRealTimers()
    }
  })

  // Type assertion tests
  it('should properly infer types', () => {
    // Test 1: Simple function type inference
    const square = (n: number): number => n * n
    const memoizedSquare = memoize(square)
    const result: number = memoizedSquare(4)
    expect(result).toBe(16)

    // Test 2: Complex object type inference
    const processUser = (user: { id: number; name: string }) => ({
      ...user,
      processed: true,
    })
    const memoizedProcessUser = memoize(processUser, (user) => user.id)
    const processedUser = memoizedProcessUser({ id: 1, name: 'John' })
    expect(processedUser.processed).toBe(true)
    expect(processedUser.id).toBe(1)

    // Test 3: Async function type inference
    const asyncDouble = async (n: number): Promise<number> => n * 2
    const memoizedAsync = memoize(asyncDouble)
    const asyncResult: Promise<number> = memoizedAsync(5)
    expect(asyncResult).toBeInstanceOf(Promise)

    // Test 4: reset method exists and is callable
    expect(typeof memoizedSquare.reset).toBe('function')
    memoizedSquare.reset() // Should not throw
  })
})
