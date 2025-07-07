import getLimit from '../get-limit-to-fetch.js'

describe('getLimit', () => {
  it('returns correct limit if there is no history', () => {
    expect(
      getLimit({
        granularity: 'day',
        history: new Map(),
        requestTimestamp: new Date('2015-12-10').getTime(),
      })
    ).toBe(1)

    expect(
      getLimit({
        granularity: 'day',
        history: new Map(),
        requestTimestamp: new Date('2015-12-09').getTime(),
      })
    ).toBe(0)

    expect(
      getLimit({
        granularity: 'hour',
        history: new Map(),
        requestTimestamp: new Date('2020-01-01').getTime(),
      })
    ).toBe(168)
  })

  it('returns correct limit if there is history', () => {
    const yesterdayDate = new Date(Date.UTC(2019, 11, 14)) // Month is 0-indexed in JS
    const history = new Map([[yesterdayDate.getTime(), { close: 1 }]])
    expect(
      getLimit({
        granularity: 'day',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 15)).getTime(),
      })
    ).toBe(1)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
      })
    ).toBe(9)
  })

  it('returns 0 if distance less than 1 day', () => {
    const nowDate = new Date(Date.UTC(2019, 11, 14))
    const history = new Map([[nowDate.getTime(), { close: 1 }]])
    expect(
      getLimit({
        granularity: 'day',
        history,
        requestTimestamp: nowDate.getTime(),
      })
    ).toBe(0)
  })

  it('returns 0 if distance less than 1 hour', () => {
    const yesterdayDate = new Date(Date.UTC(2019, 11, 14))
    const history = new Map([[yesterdayDate.getTime(), { close: 1 }]])
    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14)).getTime(),
      })
    ).toBe(0)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 1)).getTime(),
      })
    ).toBe(1)
  })

  it('returns 1 if specificTimestamp presented', () => {
    const history = new Map()
    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date('2020-01-01').getTime(),
        specificTimestamp: new Date('2020-01-01').getTime(),
      })
    ).toBe(1)
  })

  it('returns hourly limit if missing hours more than it', () => {
    const date = new Date(Date.UTC(2019, 10, 14))
    const history = new Map([[date.getTime(), { close: 1 }]])

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
        requestLimit: 168,
      })
    ).toBe(168)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
      })
    ).toBe(168)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
        requestLimit: 200,
      })
    ).toBe(200)
  })

  it('returns daily limit if missing days more than 3000', () => {
    const date = new Date(Date.UTC(2015, 11, 9))
    const history = new Map([[date.getTime(), { close: 1 }]])

    // Mock Date.now() to make the test deterministic
    const now = Date.now()
    jest.spyOn(Date, 'now').mockImplementation(() => now)

    expect(
      getLimit({
        granularity: 'day',
        history,
        requestTimestamp: now,
      })
    ).toBe(3000)

    // Restore original Date.now()
    jest.spyOn(Date, 'now').mockRestore()
  })
})
