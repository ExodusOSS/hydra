import type AccountState from '../account-state/index.js'
import Address from '../address/index.js'
import type FiatOrder from '../fiat-order/index.js'
import type FiatOrderSet from '../fiat-order-set/index.js'
import type Order from '../order/index.js'
import type OrderSet from '../order-set/index.js'
import Tx from '../tx/index.js'
import type TxSet from '../tx-set/index.js'

describe('instanceof / isInstance', () => {
  describe.each([
    {
      name: 'AccountState',
      path: '../account-state/index.js',
      getInstance: (clazz: typeof AccountState) => {
        class Child extends clazz {}

        return (params: any) => new Child(params)
      },
    },
    {
      name: 'Address',
      path: '../address/index.js',
      params: 'abc',
    },
    {
      name: 'AddressSet',
      path: '../address-set/index.js',
    },
    {
      name: 'FiatOrder',
      path: '../fiat-order/index.js',
      params: {
        orderId: 'abc',
        orderType: 'buy',
        provider: 'moonpay',
        status: 'invalid',
        fromAddress: 'abc',
        toAddress: 'abc',
        fromWalletAccount: 'exodus_0',
        toWalletAccount: 'exodus_0',
        fromAmount: 5000,
        fromAsset: 'USD',
        toAmount: 20,
        toAsset: 'ethereum',
        fiatValue: 42,
        exodusRate: 73,
        providerRate: 42,
      },
      getInstance: (clazz: typeof FiatOrder) => clazz.fromJSON,
    },
    {
      name: 'FiatOrderSet',
      path: '../fiat-order-set/index.js',
      getInstance: (clazz: typeof FiatOrderSet) => () => clazz.EMPTY,
    },
    {
      name: 'Order',
      path: '../order/index.js',
      params: {
        orderId: 'abc',
      },
      getInstance: (clazz: typeof Order) => clazz.fromJSON,
    },
    {
      name: 'OrderSet',
      path: '../order-set/index.js',
      params: [],
      getInstance: (clazz: typeof OrderSet) => clazz.fromArray,
    },
    {
      name: 'PersonalNote',
      path: '../personal-note/index.js',
      params: { txId: 'abc' },
    },
    {
      name: 'PersonalNoteSet',
      path: '../personal-note-set/index.js',
      params: [],
    },
    {
      name: 'Tx',
      path: '../tx/index.js',
      params: {
        currencies: { foo: { base: 0 } },
      },
      getInstance: (clazz: typeof Tx) => clazz.fromJSON,
    },
    {
      name: 'TxSet',
      path: '../tx-set/index.js',
      getInstance: (clazz: typeof TxSet) => () => clazz.EMPTY,
    },
    {
      name: 'UtxoCollection',
      path: '../utxo-collection/index.js',
    },
    {
      name: 'WalletAccount',
      path: '../wallet-account/index.js',
      params: { source: 'exodus', index: 0 },
    },
    {
      name: 'WalletAccountSet',
      path: '../wallet-account-set/index.js',
    },
  ])('$name', ({ name, path, getInstance, params = {} }) => {
    let V1: any
    let V2: any
    let instance: any

    beforeEach(async () => {
      ;({ default: V1 } = await import(`${path}?version=v1`))
      ;({ default: V2 } = await import(`${path}?version=v2`))

      instance = getInstance ? getInstance(V1)(params as never) : new V1(params)
    })

    const DifferentModel = name === 'Address' ? Tx : Address

    describe.each([
      { name: 'instanceof', isInstance: (clazz: any, instance: any) => instance instanceof clazz },
    ])('$name', ({ isInstance }) => {
      it('returns true for same model and same import', async () => {
        expect(isInstance(V1, instance)).toBe(true)
      })

      it('returns true for same model and different imports', async () => {
        expect(isInstance(V2, instance)).toBe(true)
      })

      it('returns false for different models', async () => {
        expect(isInstance(DifferentModel, instance)).toBe(false)
      })

      if (!getInstance) {
        it('returns true for child class of same model but different imports', async () => {
          class Child extends V2 {}
          const instance = new (Child as any)(params)

          expect(isInstance(Child, instance)).toBe(true)
          expect(isInstance(V2, instance)).toBe(true)
        })

        it('returns false for sibling classes', async () => {
          class Child1 extends V2 {}

          class Child2 extends V2 {}

          const instance1 = new (Child1 as any)(params)
          const instance2 = new (Child2 as any)(params)

          expect(isInstance(Child1, instance1)).toBe(true)
          expect(isInstance(Child1, instance2)).toBe(false)
          expect(isInstance(Child2, instance1)).toBe(false)
          expect(isInstance(Child2, instance2)).toBe(true)
        })
      }

      // This is a test for an old bug where we relied on `this.constructor`
      // when calling `Function.prototype[Symbol.hasInstance]` instead of just `this`.
      // Keeping this case specifically for that bug, as there’s no clear way
      // to spy on the read-only `Symbol.hasInstance` property.
      it('handles Function instances properly', () => {
        const noop1 = function noop() {}
        const noop2 = () => {}

        expect(isInstance(V1, noop1)).toBeFalsy()
        expect(isInstance(V1, noop2)).toBeFalsy()

        expect(isInstance(V2, noop1)).toBeFalsy()
        expect(isInstance(V2, noop2)).toBeFalsy()
      })
    })
  })
})
