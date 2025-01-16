import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { RPC } from '../index.js'
import { flattenObject } from '../rpc.js'

describe('flattenObject', () => {
  test('recursively adds functions to object', () => {
    const api = {
      destroy: () => {},
      walletAccounts: {
        enable: () => {},
        disable: () => {},
      },
      assets: {
        getAsset: () => {},
        getAssets: () => {},
      },
      keychain: {
        sodium: {
          signDetached: () => {},
        },
      },
    }

    const result = flattenObject(api)

    assert.deepEqual(result, {
      destroy: api.destroy,
      'walletAccounts!enable': api.walletAccounts.enable,
      'walletAccounts!disable': api.walletAccounts.disable,
      'assets!getAsset': api.assets.getAsset,
      'assets!getAssets': api.assets.getAssets,
      'keychain!sodium!signDetached': api.keychain.sodium.signDetached,
    })
  })

  test('omits primitves', () => {
    const api = {
      lockedAtom: {
        id: 'lockedAtom',
        set: () => {},
        get: () => {},
      },
    }

    const result = flattenObject(api)

    assert.deepEqual(result, {
      'lockedAtom!set': api.lockedAtom.set,
      'lockedAtom!get': api.lockedAtom.get,
    })
  })
})

describe('rpc', () => {
  test('exposeMethods allows exposing more methods at a later time', () => {
    const rpc = new RPC({
      transport: {
        on: () => {},
      },
    })

    const methods = {
      destroy: () => {},
      walletAccounts: {
        enable: () => {},
        disable: () => {},
      },
    }

    rpc.exposeMethods(methods)

    assert.equal(rpc._methods.size, 3)

    const moreMethods = {
      assets: {
        getAsset: () => {},
        getAssets: () => {},
      },
    }

    rpc.exposeMethods(moreMethods)

    assert.deepEqual(
      rpc._methods,
      new Map([
        ['destroy', methods.destroy],
        ['walletAccounts!enable', methods.walletAccounts.enable],
        ['walletAccounts!disable', methods.walletAccounts.disable],
        ['assets!getAsset', moreMethods.assets.getAsset],
        ['assets!getAssets', moreMethods.assets.getAssets],
      ])
    )
  })
})
