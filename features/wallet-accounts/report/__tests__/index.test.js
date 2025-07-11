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

  it('should gracefully handle when a wallet does not exist or locked', async () => {
    const report = walletAccountsReportDefinition.factory({
      walletAccountsAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
    })
    expect(report.getSchema().parse(await report.export({ walletExists: false }))).toEqual(null)
    expect(
      report.getSchema().parse(await report.export({ walletExists: true, isLocked: true }))
    ).toEqual(null)
  })

  it('should report wallet accounts', async () => {
    const report = walletAccountsReportDefinition.factory({
      walletAccountsAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
    })
    const result = report.getSchema().parse(await report.export({ walletExists: true }))
    expect(result).toMatchSnapshot()
  })
})
