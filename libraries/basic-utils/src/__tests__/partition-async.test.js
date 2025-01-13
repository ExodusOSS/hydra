import { partitionAsync } from '../async.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

jest.useFakeTimers()

describe('partitionAsync', function () {
  it('should partition using an async function', async () => {
    const resultsPromise = partitionAsync([0, 1, 2, 3], (ms) => delay(ms).then(() => ms % 2 === 0))
    jest.runAllTimers()
    await expect(resultsPromise).resolves.toEqual([
      [0, 2],
      [1, 3],
    ])
  })

  it('should throw if any partition function invocation throws', async () => {
    const resultsPromise = partitionAsync([0, 1], (ms) => {
      if (ms === 0) throw new Error('boo!')
    })

    jest.runAllTimers()
    expect(resultsPromise).rejects.toThrowError('boo!')
  })

  it('should return empty paritions if given an empty array', async () => {
    await expect(partitionAsync([])).resolves.toEqual([[], []])
  })
})
