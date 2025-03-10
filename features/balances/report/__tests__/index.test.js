import assetsBase from '@exodus/assets-base'
import { createInMemoryAtom } from '@exodus/atoms'
import { SafeError } from '@exodus/errors'
import { WalletAccount } from '@exodus/models'

import balancesReportDefinition from '../index.js'

describe('balances report', () => {
  const bitcoin = assetsBase.bitcoin.currency
  const ethereum = assetsBase.ethereum.currency

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
  const balancesData = {
    exodus_0: {
      bitcoin: { balance: bitcoin.defaultUnit(1) },
      ethereum: { balance: ethereum.defaultUnit(1) },
    },
    exodus_1: {
      bitcoin: { balance: bitcoin.defaultUnit(2) },
      ethereum: { balance: ethereum.defaultUnit(2) },
    },
  }

  const setup = ({ walletAccounts = walletAccountsData, balances = balancesData } = {}) => {
    const balancesAtom = createInMemoryAtom({ defaultValue: { balances } })
    const enabledWalletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccounts })

    return {
      balancesAtom,
      enabledWalletAccountsAtom,
    }
  }

  it('should provide the correct namespace', () => {
    const deps = setup()

    const report = balancesReportDefinition.factory(deps)

    expect(report.namespace).toEqual('balances')
  })

  it('should report balances', async () => {
    const deps = setup()

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({
      exodus_0: {
        balances: {
          bitcoin: bitcoin.defaultUnit(1).toDefaultString({ unit: true }),
          ethereum: ethereum.defaultUnit(1).toDefaultString({ unit: true }),
        },
      },
      exodus_1: {
        balances: {
          bitcoin: bitcoin.defaultUnit(2).toDefaultString({ unit: true }),
          ethereum: ethereum.defaultUnit(2).toDefaultString({ unit: true }),
        },
      },
    })
  })

  it('should skip accounts with missing balances', async () => {
    const deps = setup({
      walletAccounts: walletAccountsData,
      balances: {},
    })

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({})
  })

  it('should not include zero balances', async () => {
    const deps = setup({
      walletAccounts: walletAccountsData,
      balances: {
        exodus_0: {
          bitcoin: { balance: bitcoin.defaultUnit(1) },
          ethereum: { balance: ethereum.defaultUnit(0) },
        },
        exodus_1: { ethereum: { balance: ethereum.defaultUnit(0) } },
      },
    })

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({
      exodus_0: { balances: { bitcoin: bitcoin.defaultUnit(1).toDefaultString({ unit: true }) } },
      exodus_1: { balances: {} },
    })
  })

  it('should not include ftx accounts', async () => {
    const deps = setup({
      walletAccounts: {
        ...walletAccountsData,
        exodus_0: {
          source: 'ftx',
        },
      },
      balances: balancesData,
    })

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({
      exodus_1: {
        balances: {
          bitcoin: bitcoin.defaultUnit(2).toDefaultString({ unit: true }),
          ethereum: ethereum.defaultUnit(2).toDefaultString({ unit: true }),
        },
      },
    })
  })

  it('should expose error if accounts could not be loaded', async () => {
    const deps = setup()
    const error = new Error('Could not load wallet accounts')
    jest.spyOn(deps.enabledWalletAccountsAtom, 'get').mockRejectedValueOnce(error)

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({
      error: expect.any(SafeError),
    })
  })

  it('should expose error if balances could not be loaded', async () => {
    const deps = setup()
    const error = new Error('Could not load balances')
    jest.spyOn(deps.balancesAtom, 'get').mockRejectedValueOnce(error)

    const report = balancesReportDefinition.factory(deps)
    const result = await report.export({ walletExists: true })

    expect(result).toEqual({
      error: expect.any(SafeError),
    })
  })
})
