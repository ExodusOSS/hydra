import { createInMemoryAtom } from '@exodus/atoms'
import { isNumberUnit } from '@exodus/currency'
import { WalletAccount } from '@exodus/models'
import { deserialize, serialize } from '@exodus/models/lib/account-state/serialization.js'
import lodash from 'lodash'

import createFundedWalletAccountsAtom from '../funded-wallet-accounts.js'

const { cloneDeepWith } = lodash

const createNumberUnit = (value) => ({ isZero: value === 0 })
const serializeBalances = (data) =>
  cloneDeepWith(data, (val) => {
    if (val && isNumberUnit(val)) return serialize(val)
  })

const deserializeBalances = (data) =>
  cloneDeepWith(data, (val) => {
    if (val?.t === 'numberunit') return deserialize(val)
  })

const walletAccounts = {
  exodus_0: new WalletAccount({
    color: '#ff3974',
    enabled: true,
    icon: 'exodus',
    index: 0,
    label: 'Exodus',
    source: 'exodus',
  }),
  exodus_1: new WalletAccount({
    color: '#30d968',
    enabled: true,
    icon: 'trezor',
    index: 1,
    label: 'asdf',
    source: 'exodus',
  }),
}

describe('createFundedWalletAccountsAtom', () => {
  let balancesAtom
  let fundedWalletAccountsAtom
  let enabledWalletAccountsAtom

  beforeEach(() => {
    balancesAtom = createInMemoryAtom({ defaultValue: { balances: {} } })
    enabledWalletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccounts })
    fundedWalletAccountsAtom = createFundedWalletAccountsAtom({
      balancesAtom,
      enabledWalletAccountsAtom,
    })
  })

  it('should all be false if balances are empty', async () => {
    await expect(fundedWalletAccountsAtom.get()).resolves.toEqual({
      exodus_0: false,
      exodus_1: false,
    })
  })

  it('should all be false if all balances are zero', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await expect(fundedWalletAccountsAtom.get()).resolves.toEqual({
      exodus_0: false,
      exodus_1: false,
    })
  })

  it('should return funded walelts when some balances arent zero', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await expect(fundedWalletAccountsAtom.get()).resolves.toEqual({
      exodus_0: true,
      exodus_1: false,
    })
  })

  it('should all be true if balances arent zero', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(10) },
        },
      },
    })

    await expect(fundedWalletAccountsAtom.get()).resolves.toEqual({
      exodus_0: true,
      exodus_1: true,
    })
  })

  it('should observe balances changes', async () => {
    const subscriber = jest.fn()

    fundedWalletAccountsAtom.observe(subscriber)
    const balances = {
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    }

    await balancesAtom.set(balances)
    await balancesAtom.set(deserializeBalances(serializeBalances(balances)))

    expect(subscriber).toHaveBeenCalledWith({ exodus_0: true, exodus_1: false })
    expect(subscriber).toHaveBeenCalledTimes(1)
  })
})
