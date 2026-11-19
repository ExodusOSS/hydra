import { filterAsync } from '../async.js'

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

jest.useFakeTimers()

describe('filterAsync', function () {
  it('should filter using an async function', async () => {
    const resultsPromise = filterAsync([0, 1, 2, 3], (ms) => delay(ms).then(() => ms % 2 === 0))
    jest.runAllTimers()
    await expect(resultsPromise).resolves.toEqual([0, 2])
  })

  it('should throw if any filter function invocation throws', async () => {
    const resultsPromise = filterAsync([0, 1], (ms) => {
      if (ms === 0) throw new Error('boo!')
      return true
    })

    jest.runAllTimers()
    await expect(resultsPromise).rejects.toThrow('boo!')
  })

  it('should return an empty array if given an empty array', async () => {
    await expect(filterAsync([], () => true)).resolves.toEqual([])
  })
})
