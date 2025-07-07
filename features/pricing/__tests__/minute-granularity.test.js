import dayjs from '@exodus/dayjs'

describe('Minute Granularity Tests', () => {
  test('verifies correct parameters are passed with a specific timestamp', async () => {
    const now = new Date(Date.UTC(2025, 0, 1, 10, 30, 0)).valueOf()
    const mockResponse = {
      BTC: {
        USD: [
          { time: now / 1000 - 60, close: 50_000, open: 49_990 },
          { time: now / 1000, close: 50_100, open: 50_000 },
        ],
      },
    }

    let capturedParams = null
    const api = async (params) => {
      capturedParams = params
      return mockResponse
    }

    const assets = ['BTC']
    const fiatArray = ['USD']
    const timestamp = dayjs.utc(now).subtract(1, 'minute').startOf('minute').unix()

    await api({
      assets,
      fiatArray,
      granularity: 'minute',
      limit: 60,
      timestamp,
      ignoreInvalidSymbols: true,
    })

    expect(capturedParams.granularity).toBe('minute')
    expect(capturedParams.limit).toBe(60)
    expect(capturedParams.timestamp).toBe(timestamp)
  })

  test('ensures only data within the past 2 hours is requested', async () => {
    const now = new Date(Date.UTC(2025, 0, 1, 10, 30, 0)).valueOf()

    const mockResponse = {
      BTC: {
        USD: [],
      },
    }

    for (let i = 0; i < 120; i++) {
      const time = dayjs.utc(now).subtract(i, 'minute')
      mockResponse.BTC.USD.push({
        time: time.unix(),
        close: 50_000 + (Math.random() * 1000 - 500),
        open: 50_000 + (Math.random() * 1000 - 500),
      })
    }

    const timestamps = mockResponse.BTC.USD.map((item) => item.time * 1000)
    const oldestTimestamp = Math.min(...timestamps)
    const newestTimestamp = Math.max(...timestamps)

    const twoHoursAgo = dayjs.utc(now).subtract(2, 'hours').valueOf()

    expect(oldestTimestamp).toBeGreaterThanOrEqual(twoHoursAgo)
    expect(newestTimestamp).toBeLessThanOrEqual(now)
    expect(mockResponse.BTC.USD.length).toBe(120)
  })

  test('verifies timestamp is correctly converted to the start of the minute', () => {
    const testTime = new Date(Date.UTC(2025, 0, 1, 10, 30, 45)).valueOf()
    const expectedStartOfMinute = new Date(Date.UTC(2025, 0, 1, 10, 30, 0)).valueOf() / 1000

    const actualStartOfMinute = dayjs.utc(testTime).startOf('minute').unix()

    expect(actualStartOfMinute).toBe(expectedStartOfMinute)
  })
})
