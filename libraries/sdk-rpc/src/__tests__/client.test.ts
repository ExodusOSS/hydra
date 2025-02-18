import assert from 'node:assert/strict'
import type { Mock } from 'node:test'
import { beforeEach, describe, mock, test } from 'node:test'

import type { RPCClient } from '../client.js'
import createRPCClient from '../client.js'
import type { RPC } from '../index.js'

describe('rpc client', () => {
  let rpc: {
    callMethod: Mock<RPC['callMethod']>
    exposeMethods: Mock<RPC['exposeMethods']>
  }

  let client: RPCClient

  beforeEach(() => {
    rpc = {
      callMethod: mock.fn(),
      exposeMethods: mock.fn(),
    }

    client = createRPCClient(rpc as unknown as RPC)
  })

  const cases = [
    {
      run: () => client.walletAccounts.get('exodus_0'),
      method: 'walletAccounts!get',
      args: ['exodus_0'],
    },
    { run: () => client.assets.getAsset(), method: 'assets!getAsset', args: [] },
    {
      run: () => client.deeply.nested.batman.revealIdentity(),
      method: 'deeply!nested!batman!revealIdentity',
      args: [],
    },
  ]

  for (const { run, method: expectedMethod, args: expectedArgs } of cases) {
    test(`flattens ${expectedMethod} call path`, async () => {
      await run()

      assert.equal(rpc.callMethod.mock.calls.length, 1)
      const [method, args] = rpc.callMethod.mock.calls[0]!.arguments

      assert.equal(method, expectedMethod)
      assert.deepEqual(args, expectedArgs)
    })
  }

  test('calls exposeMethods on the rpc object', () => {
    const firstCallArgs = {
      foo: () => {},
      bar: () => {},
    }

    client.exposeMethods(firstCallArgs)

    const secondCallArgs = {
      baz: () => {},
    }

    client.exposeMethods(secondCallArgs)

    assert.equal(rpc.callMethod.mock.calls.length, 0)
    assert.equal(rpc.exposeMethods.mock.calls.length, 2)

    assert.deepEqual(rpc.exposeMethods.mock.calls[0]!.arguments, [firstCallArgs])
    assert.deepEqual(rpc.exposeMethods.mock.calls[1]!.arguments, [secondCallArgs])
  })
})
