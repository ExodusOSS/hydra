import delay from 'delay'
import pDefer from 'p-defer'

import awaitProxy from '../index.js'

// dummy module to wrap for testing
const dummyModule = {
  async asyncNoop() {},
  waitFor(promise) {
    return {
      async add(...args) {
        await promise
        return args.reduce((a, b) => a + b, 0)
      },
    }
  },
}

test('async methods', async () => {
  const initializeDeferred = pDefer()
  const proxy = awaitProxy({ object: dummyModule, delayUntil: initializeDeferred.promise })

  const mockFn = jest.fn()
  proxy.asyncNoop().then(mockFn)
  await delay(0)
  expect(mockFn).not.toHaveBeenCalled()
  initializeDeferred.resolve()
  await delay(0)
  expect(mockFn).toHaveBeenCalled()
})

test('sync methods that return object with async function', async () => {
  const initializeDeferred = pDefer()
  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: initializeDeferred.promise,
    synchronousMethods: ['waitFor'],
  })

  const mockFn = jest.fn()
  const secondDeferred = pDefer()
  proxy.waitFor(secondDeferred.promise).add(2, 2).then(mockFn)
  secondDeferred.resolve()
  await delay(0)
  expect(mockFn).not.toHaveBeenCalled()
  initializeDeferred.resolve()
  await delay(0)
  expect(mockFn).toHaveBeenCalledWith(4)
})

test('sync methods that return object can be awaited', async () => {
  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: Promise.resolve(),
    synchronousMethods: ['waitFor'],
  })

  const deferred = pDefer()

  async function getWait() {
    // unnecessary await
    const delay = await proxy.waitFor(deferred.promise)
    return delay
  }

  const w = await getWait()
  const mockFn = jest.fn()
  w.add(2, 2).then(mockFn)
  deferred.resolve()
  await delay(0)
  expect(mockFn).toHaveBeenCalledWith(4)
})

test('allowed methods should be called independently of defer promise', async () => {
  const initializeDeferred = pDefer()
  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: initializeDeferred.promise,
    allowedMethods: ['asyncNoop'],
  })

  const mockFn = jest.fn()
  proxy.asyncNoop().then(mockFn)
  await delay(0)
  expect(mockFn).toHaveBeenCalled()
  initializeDeferred.resolve()
})
