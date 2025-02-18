import test from '../../__tests__/_test.js'
import { WalletAccount } from '../../index.js'
import WalletAccountSet from '../index.js'

const baseWalletAccounts = new WalletAccountSet({
  [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
})

const acct1 = new WalletAccount({ source: 'exodus', index: 1 })
const acct2 = new WalletAccount({ source: 'exodus', index: 2 })

test('WalletAccounts', () => {
  expect(new WalletAccountSet().toJSON()).toEqual({})

  expect(new WalletAccountSet().update(baseWalletAccounts).toJSON()).toEqual({
    [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.toJSON(),
  })

  expect(baseWalletAccounts.equals(baseWalletAccounts)).toEqual(true)
  expect(baseWalletAccounts.names()).toEqual([WalletAccount.DEFAULT_NAME])

  expect(
    baseWalletAccounts.equals(
      new WalletAccountSet({
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
      })
    )
  ).toEqual(true)

  expect(baseWalletAccounts.update({ [acct1.toString()]: acct1 }).toJSON()).toEqual({
    [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.toJSON(),
    [acct1.toString()]: acct1.toJSON(),
  })

  expect(baseWalletAccounts.update({ [acct1.toString()]: acct1 }).names()).toEqual([
    WalletAccount.DEFAULT_NAME,
    acct1.toString(),
  ])

  expect(
    baseWalletAccounts
      .update({
        // accept WalletAccount
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.update({ label: 'Better Label' }),
      })
      .toJSON()
  ).toEqual({
    [WalletAccount.DEFAULT_NAME]: {
      ...WalletAccount.DEFAULT.toJSON(),
      label: 'Better Label',
    },
  })

  expect(
    baseWalletAccounts
      .update({
        // accept json
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.update({
          label: 'Better Label',
        }).toJSON(),
      })
      .toJSON()
  ).toEqual({
    [WalletAccount.DEFAULT_NAME]: {
      ...WalletAccount.DEFAULT.toJSON(),
      label: 'Better Label',
    },
  })

  // add using update
  expect(
    baseWalletAccounts
      .update({
        // accept WalletAccount
        [acct1.toString()]: acct1,
      })
      .toJSON()
  ).toEqual({
    [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.toJSON(),
    [acct1.toString()]: acct1.toJSON(),
  })

  expect(
    baseWalletAccounts
      .update({
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT.update({ label: 'Better Label' }),
      })
      .equals(baseWalletAccounts)
  ).toEqual(false)

  expect(
    baseWalletAccounts
      .update({ [acct2.toString()]: acct2 })
      .equals(baseWalletAccounts.update({ [acct1.toString()]: acct1 }))
  ).toEqual(false)

  expect(baseWalletAccounts.get('toString')).toBeUndefined()
  expect(baseWalletAccounts.get(WalletAccount.DEFAULT)).toEqual(WalletAccount.DEFAULT)
  expect(baseWalletAccounts.get(WalletAccount.DEFAULT_NAME)).toEqual(WalletAccount.DEFAULT)
})
