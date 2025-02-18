import { createInMemoryAtom } from '@exodus/atoms'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { AccountState, TxSet } from '@exodus/models'

import blockchainMetadataReportDefinition from '../index.js'

describe('blockchainMetadataReport', () => {
  const txLogsData = {
    exodus_0: {
      ethereum: TxSet.fromArray([
        {
          txId: '0xff11e3ea4a32c95f86d49521ba2dbadf0b5e153c9d9849c0d395b05ce35cd746',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.23637286 ETH',
          coinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          feeCoinName: 'ethereum',
          to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
          currencies: { ethereum: ethereumMeta.currency },
        },
      ]),
    },
  }

  class EthereumAccountState extends AccountState {
    static defaults = {
      cursor: '',
      balance: ethereumMeta.currency.ZERO,
    }
  }
  const accountStatesData = {
    exodus_0: {
      ethereum: EthereumAccountState.create(),
    },
  }

  const setup = ({ txLogs = txLogsData, accountStates = accountStatesData } = {}) => ({
    txLogsAtom: createInMemoryAtom({ defaultValue: txLogs }),
    accountStatesAtom: createInMemoryAtom({ defaultValue: accountStates }),
  })

  it('should provide the correct namespace', async () => {
    const deps = setup()

    const report = blockchainMetadataReportDefinition.factory(deps)

    expect(report.namespace).toEqual('blockchainMetadata')
  })

  it('should report tx logs', async () => {
    const deps = setup()

    const report = blockchainMetadataReportDefinition.factory(deps)
    const result = await report.export()

    expect(result.txLogs).toEqual(txLogsData)
  })

  it('should report account states', async () => {
    const deps = setup()

    const report = blockchainMetadataReportDefinition.factory(deps)
    const result = await report.export()

    expect(result.accountStates).toEqual(accountStatesData)
  })

  it('should reject when tx logs could not be loaded', async () => {
    const { txLogsAtom, accountStatesAtom } = setup()

    const error = new Error('Could not load tx logs')
    jest.spyOn(txLogsAtom, 'get').mockRejectedValueOnce(error)

    const report = blockchainMetadataReportDefinition.factory({ txLogsAtom, accountStatesAtom })

    await expect(report.export()).rejects.toEqual(error)
  })

  it('should reject when account states could not be loaded', async () => {
    const { txLogsAtom, accountStatesAtom } = setup()

    const error = new Error('Could not load account states')
    jest.spyOn(accountStatesAtom, 'get').mockRejectedValueOnce(error)

    const report = blockchainMetadataReportDefinition.factory({ txLogsAtom, accountStatesAtom })

    await expect(report.export()).rejects.toEqual(error)
  })
})
