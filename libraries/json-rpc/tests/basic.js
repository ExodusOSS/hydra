/* eslint-disable no-throw-literal, sonarjs/no-throw-literal */
const EventEmitter = require('events')
const test = require('@exodus/test/tape')
const RPC = require('../index.js')
const { delay, createPair } = require('./util')

test('callMethod - sync result', function (t) {
  t.plan(3)
  const [client, server] = createPair()
  server.exposeMethods({
    testMethod: (param1, param2) => {
      t.equal(param1, 123)
      t.equal(param2, 345)
      return 567
    },
  })

  client
    .callMethod('testMethod', [123, 345])
    .then((result) => t.equal(result, 567))
    .catch(t.fail)
})

test('callMethod - sync error without cause', function (t) {
  const errorMessage = 'this is fine'
  t.plan(2)
  const [client, server] = createPair()
  const cause = new Error('some explanation')
  server.exposeMethods({
    testMethod: () => {
      throw new Error(errorMessage, { cause })
    },
  })

  client
    .callMethod('testMethod')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.message, errorMessage)
      t.equal(err.cause, undefined)
    })
})

test('callMethod - sync error with cause', function (t) {
  const [client, server] = createPair({ getIsDevelopmentMode: () => true })
  const error2 = new Error('error level 2')
  const error1 = new Error('error level 1', { cause: error2 })
  const error = new Error('error level 0', { cause: error1 })
  server.exposeMethods({
    testMethod: () => {
      throw error
    },
  })

  client
    .callMethod('testMethod')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.message, error.message)
      t.equal(err.cause.message, error.message)
      t.equal(err.cause.stack, error.stack)
      t.end()
    })
})

test('callMethod - sync error with name', function (t) {
  const errorMessage = 'this is fine'
  t.plan(2)
  const [client, server] = createPair()
  server.exposeMethods({
    testMethod: () => {
      const error = new Error(errorMessage)
      error.name = 'SomeError'
      throw error
    },
  })

  client
    .callMethod('testMethod')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.message, errorMessage)
      t.equal(err.name, 'SomeError')
    })
})

test('callMethod - async result', function (t) {
  t.plan(1)
  const [client, server] = createPair()
  server.exposeMethods({
    testMethod: async (ms) => {
      await delay(ms)
      return ms + 1
    },
  })

  client
    .callMethod('testMethod', [1])
    .then((result) => t.equal(result, 2))
    .catch(t.fail)
})

test('callMethod - async with void result', function (t) {
  t.plan(1)
  const [client, server] = createPair()
  server.exposeMethods({
    testMethod: async (ms) => {
      await delay(ms)
    },
  })

  client
    .callMethod('testMethod', [1])
    .then((result) => {
      console.trace()
      t.equal(result, undefined)
    })
    .catch(t.fail)
})

test('callMethod - async error', function (t) {
  const errorMessage = 'this is fine'
  t.plan(1)
  const [client, server] = createPair()
  server.exposeMethods({
    testMethod: async (ms) => {
      await delay(ms)
      throw new Error(errorMessage)
    },
  })

  client
    .callMethod('testMethod')
    .then(t.fail)
    .catch((err) => t.equal(err.message, errorMessage))
})

test('two asynchronous functions, second finishes before first (out of order response)', function (t) {
  t.plan(1)
  const [client, server] = createPair()

  server.exposeMethods({
    testFast: async (param1, param2) => {
      await delay(100)
      return param1 - param2
    },
    testSlow: async (param1, param2) => {
      await delay(200)
      return param1 + param2
    },
  })

  const p1 = client.callMethod('testFast', [10, 5])
  const p2 = client.callMethod('testSlow', [11, 12])
  Promise.all([p1, p2])
    .then((results) => t.deepEqual(results, [5, 23]))
    .catch(t.fail)
})

test('.notify() one way message', function (t) {
  t.plan(2)
  const [client, server] = createPair()
  server.exposeMethods({
    signalListener: (data) => t.equal(data, 42),
  })

  t.doesNotThrow(() => {
    client.notify('signalListener', 42)
  })
})

test('timeout', function (t) {
  t.plan(1)
  const [client, server] = createPair({ requestTimeout: 100 })

  server.exposeMethods({
    testSum: async (param1, param2) => {
      await delay(200)
      return param1 + param2
    },
  })

  client
    .callMethod('testSum', [1, 2])
    .then(t.fail)
    .catch((err) => {
      t.equal(err.message, 'JSON-RPC: method call timeout calling testSum')
    })
})

test('calling missing method', function (t) {
  t.plan(2)
  const [client] = createPair({ requestTimeout: 100 })
  client
    .callMethod('testSum', [1, 2])
    .then(t.fail)
    .catch((err) => {
      t.equal(err.message, 'Method not found')
      t.equal(err.data.methodName, 'testSum')
    })
})

test('ping-pong: test client-server bidirectional communication', function (t) {
  t.plan(2)
  const [client, server] = createPair()

  client.exposeMethods({
    pong: (counter, message) => {
      if (counter) {
        return client.callMethod('ping', [counter - 1, `${message}-client${counter}`])
      }

      return `${message}-finish`
    },
  })

  server.exposeMethods({
    ping: (counter, message) => {
      if (counter) {
        return server.callMethod('pong', [counter - 1, `${message}-server${counter}`])
      }

      return `${message}-finish`
    },
  })

  client
    .callMethod('ping', [4, 'start'])
    .then((result) => t.equal(result, 'start-server4-client3-server2-client1-finish'))
    .catch(t.fail)

  server
    .callMethod('pong', [4, 'start'])
    .then((result) => t.equal(result, 'start-client4-server3-client2-server1-finish'))
    .catch(t.fail)
})

test('.end()', function (t) {
  t.plan(1)
  const [client] = createPair()
  t.doesNotThrow(() => client.end())
})

test('exposing non-function', function (t) {
  t.plan(1)
  const [client, server] = createPair({ requestTimeout: 100 })
  server.exposeMethods({ test: 42 })
  client
    .callMethod('test')
    .then(t.fail)
    .catch((err) => t.equal(err.code, -32_603))
})

test('constructor parameter validation', function (t) {
  t.plan(2)
  t.throws(() => new RPC(), new Error('TRANSPORT_REQUIRED'))
  t.throws(() => new RPC({}), new Error('TRANSPORT_REQUIRED'))
})

test('throws invalid json messages', function (t) {
  t.plan(1)
  const [client] = createPair()
  t.throws(() => {
    client._transport.emit('data', '__')
  })
})

test('ignores incorrect but valid json messages', function (t) {
  t.plan(1)
  const [client] = createPair()
  t.doesNotThrow(() => {
    client._transport.emit('data', '{}')
  })
})

test('responds with error even when method implementation throws non Error', function (t) {
  t.plan(8)
  const [client, server] = createPair()
  server.exposeMethods({
    throwNumber: () => {
      throw 10
    },
    throwUndefined: () => {
      throw undefined
    },
    throwNull: () => {
      throw null
    },
    throwPromise: () => {
      throw Promise.resolve(1)
    },
    throwObject: () => {
      throw { code: 1234, foo: 'bar' }
    },
  })

  client
    .callMethod('throwNumber')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.code, -32_603)
      t.equal(err.data, 10)
    })

  client
    .callMethod('throwNull')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.code, -32_603)
      t.equal(err.data, null)
    })

  client
    .callMethod('throwPromise')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.code, -32_603)
      t.deepEqual(err.data, {})
    })

  client
    .callMethod('throwObject')
    .then(t.fail)
    .catch((err) => {
      t.equal(err.code, 1234)
      t.deepEqual(err.data, { foo: 'bar' })
    })
})

test('ignores messages with same id after reply was already received', function (t) {
  t.plan(2)
  const transport = new EventEmitter()
  const client = new RPC({ transport })
  transport.write = (message) =>
    t.equal(message, '{"jsonrpc":"2.0","method":"testCall","params":[42],"id":0}')
  const promise = client.callMethod('testCall', [42])
  transport.emit('data', '{"jsonrpc":"2.0", "result": 43,"id":0}')
  promise
    .then((response) => {
      t.equal(response, 43)
      transport.emit('data', '{"jsonrpc":"2.0", "result": 44,"id":0}')
    })
    .catch(t.fail)
})

test('expose functions via exposeFunction', function (t) {
  t.plan(2)
  const [client, server] = createPair()
  server.exposeFunction('test1', (input) => input + 2)
  server.exposeFunction('test2', (input) => input + 5)

  client.callMethod('test1', 10).then((result) => t.equal(result, 12))
  client.callMethod('test2', 10).then((result) => t.equal(result, 15))
})

test('throws error if transport.write fails', function (t) {
  t.plan(1)
  const expectedErr = new Error('failed to write')
  const [client, server] = createPair()
  client._transport.write = async () => {
    throw expectedErr
  }

  server.exposeFunction('test', (i) => i + 1)

  client
    .callMethod('test', [0])
    .then(() => t.fail('should have errored out'))
    .catch((err) => t.same(err, expectedErr, 'expected error thrown when writing to transport'))
})

test('returns raw response with callMethodWithRawResponse', function (t) {
  t.plan(2)
  const [client, server] = createPair()

  server.exposeFunction('test', () => 'foobar')
  client
    .callMethodWithRawResponse('test', [])
    .then((result) => {
      const expected = { jsonrpc: '2.0', id: 0, result: 'foobar' }
      t.same(result, expected, 'returned entire json-rpc response object')
    })
    .catch(t.fail)

  const err = new Error('woopsie')
  server.exposeFunction('errormethod', () => {
    throw err
  })
  client
    .callMethodWithRawResponse('errormethod', [])
    .then((result) => {
      const expected = {
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32_603, message: 'woopsie', data: {} },
      }
      t.same(result, expected, 'returned entire json-rpc error response')
    })
    .catch(t.fail)
})
