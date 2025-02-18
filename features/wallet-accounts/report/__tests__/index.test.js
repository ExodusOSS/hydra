import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import walletAccountsReportDefinition from '../index.js'

describe('walletAccountsReport', () => {
  let walletAccountsAtom
  let activeWalletAccountAtom
  let multipleWalletAccountsEnabledAtom

  const walletAccountsData = {
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

  beforeEach(() => {
    walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccountsData })
    activeWalletAccountAtom = createInMemoryAtom({ defaultValue: 'exodus_0' })
    multipleWalletAccountsEnabledAtom = createInMemoryAtom({ defaultValue: undefined })
  })

  it('should provide the correct namespace', async () => {
    const report = walletAccountsReportDefinition.factory({
      walletAccountsAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
    })

    expect(report.namespace).toEqual('walletAccounts')
  })

  it('should report wallet accounts', async () => {
    const report = walletAccountsReportDefinition.factory({
      walletAccountsAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
    })
    const result = await report.export()

    const data = Object.fromEntries(
      Object.entries(walletAccountsData).map(([key, walletAccount]) => [
        key,
        new WalletAccount({ ...walletAccount, label: '<Redacted>' }),
      ])
    )

    expect(result).toEqual({
      data,
      configuredActiveWalletAccount: 'exodus_0',
      multipleWalletAccountsEnabled: undefined,
    })
  })
})
