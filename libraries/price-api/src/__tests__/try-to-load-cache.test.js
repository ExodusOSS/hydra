import tryToLoadCache from '../try-to-load-cache'
import test from 'tape'

test('tryToLoadCache returns runtime cache if exist', (t) => {
  const runtimeCache = new Map()
  const runtimeCacheKey = 'BTC-USD-day'
  const history = new Map([[1, { close: 1, high: 2 }]])
  runtimeCache.set(runtimeCacheKey, history)
  const getCacheFromStorage = () => null

  t.same(
    tryToLoadCache({
      runtimeCacheKey,
      runtimeCache,
      getCacheFromStorage,
    }),
    history
  )

  t.end()
})

test('tryToLoadCache loads cache if runtime cache does not exist', (t) => {
  const runtimeCache = new Map()
  const runtimeCacheKey = 'BTC-USD-day'
  const historyData = [[1, { close: 1, high: 2 }]]
  const history = new Map(historyData)
  const getCacheFromStorage = () => Promise.resolve(historyData)

  t.same(
    tryToLoadCache({
      runtimeCacheKey,
      runtimeCache,
      getCacheFromStorage,
    }),
    history
  )

  t.end()
})

test('tryToLoadCache returns empty map if getCacheFromStorage does not exist', (t) => {
  const runtimeCache = new Map()
  const runtimeCacheKey = 'BTC-USD-day'
  const history = new Map()

  t.same(
    tryToLoadCache({
      runtimeCacheKey,
      runtimeCache,
    }),
    history
  )

  t.end()
})
