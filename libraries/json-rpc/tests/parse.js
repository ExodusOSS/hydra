const test = require('@exodus/test/tape')
const { createPair } = require('./util')

test('custom parsing function', function (t) {
  t.plan(1)
  const [client, server] = createPair({
    parse: (jsonString) => {
      const message = JSON.parse(jsonString)
      if (message.params && message.params[0]) {
        message.params[0].foo = 'yes'
      }

      return message
    },
  })
  server.exposeFunction('echo', (data) => data)

  client
    .callMethod('echo', [{ bar: 'no' }])
    .then((result) => t.same(result, { bar: 'no', foo: 'yes' }, 'extended the input'))
})

test('custom parsing function which throws', async function (t) {
  const [client, server] = createPair({
    parse: (jsonString) => {
      if (jsonString.includes('FORBIDDEN')) {
        throw new Error('You used the forbidden word. Bad dog')
      }

      return JSON.parse(jsonString)
    },
  })

  server.exposeFunction('method', () => 'some value')

  await client
    .callMethod('method', [{ value: 'FORBIDDEN' }])
    .then(() => t.fail('did not throw error'))
    .catch((err) =>
      t.is(err.message, 'You used the forbidden word. Bad dog', 'fails when using a forbidden word')
    )

  await client
    .callMethod('method')
    .then((val) => t.is(val, 'some value', 'method works when no forbidden word used'))
})
