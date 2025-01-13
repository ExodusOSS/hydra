import delay from 'delay'

import awaitProxy from '../index.js'

// dummy module to wrap for testing
const dummyModule = {
  async asyncNoop() {},
  delay(time) {
    return {
      async add(...args) {
        await delay(time)
        return args.reduce((a, b) => a + b, 0)
      },
    }
  },
}

test('async methods', async () => {
  let resolveInitializePromise
  const initializePromise = new Promise((resolve) => (resolveInitializePromise = resolve))

  const proxy = awaitProxy({ object: dummyModule, delayUntil: initializePromise })

  const mockFn = jest.fn()
  proxy.asyncNoop().then(mockFn)
  await delay(0)
  expect(mockFn).not.toHaveBeenCalled()
  resolveInitializePromise()
  await delay(0)
  expect(mockFn).toHaveBeenCalled()
})

test('sync methods that return object with async function', async () => {
  let resolveInitializePromise
  const initializePromise = new Promise((resolve) => (resolveInitializePromise = resolve))

  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: initializePromise,
    synchronousMethods: ['delay'],
  })

  const mockFn = jest.fn()
  proxy.delay(5).add(2, 2).then(mockFn)
  await delay(10)
  expect(mockFn).not.toHaveBeenCalled()
  resolveInitializePromise()
  await delay(10)
  expect(mockFn).toHaveBeenCalledWith(4)
})

test('sync methods that return object can be awaited', async () => {
  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: Promise.resolve(),
    synchronousMethods: ['delay'],
  })

  async function getDelay5() {
    // unnecessary await
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const delay = await proxy.delay(5)
    return delay
  }

  const d = await getDelay5()
  const mockFn = jest.fn()
  d.add(2, 2).then(mockFn)
  await delay(10)
  expect(mockFn).toHaveBeenCalledWith(4)
})

test('allowed methods should be called independently of defer promise', async () => {
  let resolveInitializePromise
  const initializePromise = new Promise((resolve) => (resolveInitializePromise = resolve))

  const proxy = awaitProxy({
    object: dummyModule,
    delayUntil: initializePromise,
    allowedMethods: ['asyncNoop'],
  })

  const mockFn = jest.fn()
  proxy.asyncNoop().then(mockFn)
  await delay(0)
  expect(mockFn).toHaveBeenCalled()
  resolveInitializePromise()
})
