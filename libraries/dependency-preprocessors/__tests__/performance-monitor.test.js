import performanceMonitor from '../src/preprocessors/performance-monitor.js'
import { when } from 'jest-when'

describe('performanceMonitor', () => {
  let now
  let debug
  let onAboveThreshold
  let processedNode

  class Potter {
    cast(spell) {
      return spell
    }

    async castAsync(spell) {
      await new Promise(setImmediate)
      return spell
    }
  }

  beforeEach(() => {
    const node = {
      definition: {
        id: 'potter',
        factory: () => new Potter(),
      },
    }

    now = jest.fn()
    when(now).calledWith().mockReturnValueOnce(0).mockReturnValueOnce(142)
    debug = jest.fn()
    onAboveThreshold = jest.fn()

    processedNode = performanceMonitor({
      now,
      onAboveThreshold,
      config: { enabled: true },
    }).preprocess(node)
  })

  it('should notify duration of sync method', () => {
    const potter = processedNode.definition.factory()

    const result = potter.cast('lumos')
    expect(result).toEqual('lumos') // testing this is sync and the return value not altered

    expect(onAboveThreshold).toHaveBeenCalledTimes(1)
    expect(onAboveThreshold).toHaveBeenCalledWith({
      id: processedNode.definition.id,
      method: 'cast',
      async: false,
      duration: 142,
    })
  })

  it('should log performance of async method', async () => {
    const potter = processedNode.definition.factory()

    const promise = potter.castAsync('lumos')
    expect(debug).not.toHaveBeenCalled()

    await promise
    expect(onAboveThreshold).toHaveBeenCalledTimes(1)
    expect(onAboveThreshold).toHaveBeenCalledWith({
      id: processedNode.definition.id,
      method: 'castAsync',
      async: true,
      duration: 142,
    })
  })

  it('should not log calls taking less than critical threshold', async () => {
    const potter = processedNode.definition.factory()
    now.mockReset()
    when(now).calledWith().mockReturnValueOnce(0).mockReturnValueOnce(22)

    potter.cast('lumos')

    expect(onAboveThreshold).not.toHaveBeenCalled()
  })
})
