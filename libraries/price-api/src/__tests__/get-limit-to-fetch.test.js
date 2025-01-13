import getLimit from '../get-limit-to-fetch'
import test from 'tape'

test('getLimit returns correct limit if there is no history', (t) => {
  t.same(
    getLimit({
      granularity: 'day',
      history: new Map(),
      requestTimestamp: new Date('2015-12-10').getTime(),
    }),
    1
  )

  t.same(
    getLimit({
      granularity: 'day',
      history: new Map(),
      requestTimestamp: new Date('2015-12-09').getTime(),
    }),
    0
  )

  t.same(
    getLimit({
      granularity: 'hour',
      history: new Map(),
      requestTimestamp: new Date('2020-01-01').getTime(),
    }),
    168
  )

  t.end()
})

test('getLimit returns correct limit if there is history', (t) => {
  const yesterdayDate = new Date(Date.UTC(2019, 12, 14))
  const history = new Map([[yesterdayDate.getTime(), { close: 1 }]])
  t.same(
    getLimit({
      granularity: 'day',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 15)).getTime(),
    }),
    1
  )

  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14, 9)).getTime(),
    }),
    9,
    'return exact missing hours count'
  )

  t.end()
})

test('getLimit returns 0 if distance less than 1 day', (t) => {
  const nowDate = new Date(Date.UTC(2019, 12, 14))
  const history = new Map([[nowDate.getTime(), { close: 1 }]])
  t.same(
    getLimit({
      granularity: 'day',
      history,
      requestTimestamp: nowDate.getTime(),
    }),
    0
  )

  t.end()
})

test('getLimit returns 0 if distance less than 1 hour', (t) => {
  const yesterdayDate = new Date(Date.UTC(2019, 12, 14))
  const history = new Map([[yesterdayDate.getTime(), { close: 1 }]])
  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14)).getTime(),
    }),
    0
  )

  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14, 1)).getTime(),
    }),
    1
  )

  t.end()
})

test('getLimit returns 1 if specificTimestamp presented', (t) => {
  const history = new Map()
  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date('2020-01-01').getTime(),
      specificTimestamp: new Date('2020-01-01').getTime(),
    }),
    1
  )

  t.end()
})

test('getLimit returns hourly limit if missing hours more than it', (t) => {
  const date = new Date(Date.UTC(2019, 10, 14))
  const history = new Map([[date.getTime(), { close: 1 }]])

  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14, 9)).getTime(),
      requestLimit: 168,
    }),
    168,
    'return exact missing hours count'
  )

  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14, 9)).getTime(),
    }),
    168,
    'return exact missing hours count using constant options'
  )

  t.same(
    getLimit({
      granularity: 'hour',
      history,
      requestTimestamp: new Date(Date.UTC(2019, 12, 14, 9)).getTime(),
      requestLimit: 200,
    }),
    200,
    'return exact missing hours count'
  )

  t.end()
})

test('getLimit returns daily limit if missing days more than 3000', (t) => {
  const date = new Date(Date.UTC(2015, 11, 9))
  const history = new Map([[date.getTime(), { close: 1 }]])

  t.same(
    getLimit({
      granularity: 'day',
      history,
      requestTimestamp: new Date().getTime(),
    }),
    3000,
    'return exact maximum daily limit count'
  )

  t.end()
})
