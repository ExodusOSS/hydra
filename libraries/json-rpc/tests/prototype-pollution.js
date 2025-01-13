const test = require('tape')
const { createPair } = require('./util')

test('callMethod cannot be tricked by prototype illusion', async (t) => {
  const [client, server] = createPair()

  server.exposeFunction('sneeze', () => 'aahhhhCHOOO!')

  try {
    await client.callMethod('hasOwnProperty', 'sneeze')
    t.fail('called nonexistent method')
  } catch (err) {
    t.is(err.message, 'Method not found', 'did not call nonexistent method')
  }

  t.end()
})

test('Pending request cache cannot be tricked by prototype illusion', async (t) => {
  const [, server] = createPair()

  try {
    server._transport.emit('data', JSON.stringify({
      jsonrpc: '2.0',
      id: 'toString',
      result: 'Muahahaha'
    }))
    t.pass('invalid ID is ignored')
  } catch (err) {
    t.fail('error occurred because of bad ID')
  }

  t.end()
})
