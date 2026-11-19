import {
  DEFAULT_DAILY_REQUEST_LIMIT,
  DEFAULT_HOURLY_REQUEST_LIMIT,
  DEFAULT_MINUTELY_REQUEST_LIMIT,
} from '../../constants.js'
import getLimit from '../get-limit-to-fetch.js'

describe('getLimit', () => {
  it('returns correct limit if there is no history', () => {
    expect(
      getLimit({
        granularity: 'day',
        history: new Map(),
        requestTimestamp: new Date('2015-12-10').getTime(),
        requestLimit: DEFAULT_DAILY_REQUEST_LIMIT,
      })
    ).toBe(1)

    expect(
      getLimit({
        granularity: 'day',
        history: new Map(),
        requestTimestamp: new Date('2015-12-09').getTime(),
        requestLimit: DEFAULT_DAILY_REQUEST_LIMIT,
      })
    ).toBe(0)

    expect(
      getLimit({
        granularity: 'hour',
        history: new Map(),
        requestTimestamp: new Date('2020-01-01').getTime(),
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
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
        requestLimit: DEFAULT_DAILY_REQUEST_LIMIT,
      })
    ).toBe(1)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
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
        requestLimit: DEFAULT_DAILY_REQUEST_LIMIT,
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
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
      })
    ).toBe(0)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 1)).getTime(),
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
      })
    ).toBe(1)
  })

  it('returns 0 if distance less than 1 minute', () => {
    const yesterdayDate = new Date(Date.UTC(2019, 11, 14))
    const history = new Map([[yesterdayDate.getTime(), { close: 1 }]])
    expect(
      getLimit({
        granularity: 'minute',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14)).getTime(),
        requestLimit: DEFAULT_MINUTELY_REQUEST_LIMIT,
      })
    ).toBe(0)

    expect(
      getLimit({
        granularity: 'minute',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 0, 1)).getTime(),
        requestLimit: DEFAULT_MINUTELY_REQUEST_LIMIT,
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
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
      })
    ).toBe(1)
  })

  it('returns requestLimit if missing days more than it', () => {
    const date = new Date(Date.UTC(2015, 11, 9))
    const history = new Map([[date.getTime(), { close: 1 }]])

    expect(
      getLimit({
        granularity: 'day',
        history,
        requestTimestamp: Date.now(),
        requestLimit: DEFAULT_DAILY_REQUEST_LIMIT,
      })
    ).toBe(DEFAULT_DAILY_REQUEST_LIMIT)

    expect(
      getLimit({
        granularity: 'day',
        history,
        requestTimestamp: Date.now(),
        requestLimit: 3000,
      })
    ).toBe(3000)
  })

  it('returns requestLimit if missing hours more than it', () => {
    const date = new Date(Date.UTC(2019, 10, 14))
    const history = new Map([[date.getTime(), { close: 1 }]])

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
        requestLimit: DEFAULT_HOURLY_REQUEST_LIMIT,
      })
    ).toBe(DEFAULT_HOURLY_REQUEST_LIMIT)

    expect(
      getLimit({
        granularity: 'hour',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 11, 14, 9)).getTime(),
        requestLimit: 200,
      })
    ).toBe(200)
  })

  it('returns requestLimit if missing minutes more than it', () => {
    const date = new Date(Date.UTC(2019, 10, 14))
    const history = new Map([[date.getTime(), { close: 1 }]])

    expect(
      getLimit({
        granularity: 'minute',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 10, 14, 9)).getTime(),
        requestLimit: DEFAULT_MINUTELY_REQUEST_LIMIT,
      })
    ).toBe(DEFAULT_MINUTELY_REQUEST_LIMIT)

    expect(
      getLimit({
        granularity: 'minute',
        history,
        requestTimestamp: new Date(Date.UTC(2019, 10, 14, 9)).getTime(),
        requestLimit: 60,
      })
    ).toBe(60)
  })
})
