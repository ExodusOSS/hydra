import { createInMemoryAtom } from '@exodus/atoms'
import fiat from '@exodus/fiat-currencies'
import { WalletAccount } from '@exodus/models'

import { fiatBalancesAtomDefinition } from '../../atoms/index.js'
import fiatBalancesReportDefinition from '../index.js'

const { factory: createFiatBalancesAtom } = fiatBalancesAtomDefinition
const { factory: createFiatBalancesReportReport } = fiatBalancesReportDefinition

export const createFiatNumberUnit = (value) => fiat.USD.defaultUnit(value)

const trezorAccount = new WalletAccount({
  id: '123',
  model: 'T',
  source: 'trezor',
  index: 0,
})

const walletAccounts = {
  exodus_0: WalletAccount.DEFAULT,
  exodus_1: new WalletAccount({ source: 'exodus', index: 1 }),
  [trezorAccount]: trezorAccount,
}

describe('fiatBalancesReport', () => {
  let reportNode
  let fiatBalancesAtom
  let walletAccountsAtom
  beforeEach(() => {
    fiatBalancesAtom = createFiatBalancesAtom()
    walletAccountsAtom = createInMemoryAtom({
      defaultValue: walletAccounts,
    })

    reportNode = createFiatBalancesReportReport({
      wallet: {
        exists: async () => true,
      },
      walletAccountsAtom,
      fiatBalancesAtom,
    })
  })

  it('should have correct namespace', () => {
    expect(reportNode.namespace).toEqual('fiatBalances')
  })

  it('should create proper report', async () => {
    await fiatBalancesAtom.set({
      balances: {
        byWalletAccount: {
          exodus_0: {
            balance: createFiatNumberUnit(50),
          },
          exodus_1: {
            balance: createFiatNumberUnit(20),
          },
          [trezorAccount]: {
            balance: createFiatNumberUnit(30),
          },
        },
      },
    })
    const report = await reportNode.export({ walletExists: true })

    const expectedReport = {
      exodus_0: '50 USD',
      exodus_1: '20 USD',
    }

    expect(report).toEqual(expectedReport)
  })
})
