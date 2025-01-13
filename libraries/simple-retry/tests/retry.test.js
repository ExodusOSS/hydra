import { retry } from '../src/index.js'

// Throws n times before succeeding
async function testFun(n, testFunData) {
  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  if (n > testFunData.n++) {
    // console.log(`testFun throwing at run ${testFunData.n}`)
    throw new Error(`Error at retry ${testFunData.n}`)
  }

  // console.log(`testFun not throwing at run ${testFunData.n}`)
  return testFunData
}

describe('Retry tests', () => {
  const testFunData = {}

  test('Retry twice then throw', async () => {
    const testFunWithRetry = retry(testFun, { delayTimesMs: [1, 5] })

    testFunData.n = 0
    await testFunWithRetry(0, testFunData)
    expect(testFunData.n).toEqual(1)

    testFunData.n = 0
    await testFunWithRetry(1, testFunData)
    expect(testFunData.n).toEqual(2)

    testFunData.n = 0
    await testFunWithRetry(2, testFunData)
    expect(testFunData.n).toEqual(3)

    testFunData.n = 0
    await expect(testFunWithRetry(3, testFunData)).rejects.toThrow('Error at retry 3')
    expect(testFunData.n).toEqual(3)

    testFunData.n = 0
    await expect(testFunWithRetry(4, testFunData)).rejects.toThrow('Error at retry 3')
    expect(testFunData.n).toEqual(3)
  })

  test('Retry with final error', async () => {
    const testFunWithRetry = retry(
      async (n, testFunData) => {
        try {
          await testFun(n, testFunData)
        } catch (e) {
          if (/Error at retry 1/.test(e.message)) e.finalError = true
          throw e
        }
      },
      { delayTimesMs: ['10s'] }
    )

    testFunData.n = 0
    await testFunWithRetry(0, testFunData)
    expect(testFunData.n).toEqual(1)

    testFunData.n = 0
    await expect(testFunWithRetry(1, testFunData)).rejects.toThrow('Error at retry 1')
    expect(testFunData.n).toEqual(1)

    testFunData.n = 0
    await expect(testFunWithRetry(2, testFunData)).rejects.toThrow('Error at retry 1')
    expect(testFunData.n).toEqual(1)
  })

  test('Collect exceptions', async () => {
    const testFunWithRetry = retry(testFun, { delayTimesMs: [1, 2] })

    testFunData.n = 0
    try {
      await testFunWithRetry(3, testFunData)
      throw new Error('This should have failed')
    } catch (e) {
      expect(e.errorChain.length).toEqual(2)
      expect(testFunData.n).toEqual(3)
    }
  })
})
