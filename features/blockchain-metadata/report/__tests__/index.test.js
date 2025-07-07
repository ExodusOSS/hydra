import { createInMemoryAtom } from '@exodus/atoms'
import { omit } from '@exodus/basic-utils'
import { asset as bitcoinMeta } from '@exodus/bitcoin-meta'
import { asset as ethereumMeta } from '@exodus/ethereum-meta'
import { AccountState, TxSet } from '@exodus/models'
import { asset as moneroMeta } from '@exodus/monero-meta'

import blockchainMetadataReportDefinition from '../index.js'

const ethTxJson = {
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
}

const moneroTxJson = {
  txId: '123',
  error: null,
  date: '2020-07-22T13:54:28.000Z',
  confirmations: 1,
  meta: {
    isSend: true,
  },
  token: null,
  dropped: false,
  coinAmount: '-0.1 XMR',
  coinName: 'monero',
  feeAmount: '0.01 XMR',
  feeCoinName: 'monero',
  to: 'abc',
  currencies: { monero: moneroMeta.currency },
}

const defaultEarliestTxDate = ethTxJson.date

describe('blockchainMetadataReport', () => {
  const txLogsData = {
    exodus_0: {
      ethereum: TxSet.fromArray([ethTxJson]),
      monero: TxSet.fromArray([moneroTxJson]),
    },
  }

  class EthereumAccountState extends AccountState {
    static defaults = {
      cursor: '',
      balance: ethereumMeta.currency.ZERO,
    }
  }

  class BitcoinAccountState extends AccountState {
    static defaults = {
      balance: bitcoinMeta.currency.ZERO,
      utxos: [
        {
          some: 'thing',
        },
      ],
    }
  }

  const accountStatesData = {
    exodus_0: {
      ethereum: EthereumAccountState.create(),
      bitcoin: BitcoinAccountState.create(),
    },
  }

  const setup = ({
    txLogs = txLogsData,
    accountStates = accountStatesData,
    enabledAssets = {
      bitcoin: true,
      ethereum: true,
      monero: true,
    },
    earliestTxDate = defaultEarliestTxDate,
  } = {}) => ({
    earliestTxDateAtom: createInMemoryAtom({ defaultValue: earliestTxDate }),
    txLogsAtom: createInMemoryAtom({ defaultValue: { value: txLogs } }),
    accountStatesAtom: createInMemoryAtom({ defaultValue: { value: accountStates } }),
    enabledAssetsAtom: createInMemoryAtom({
      defaultValue: enabledAssets,
    }),
  })

  it('should provide the correct namespace', async () => {
    const deps = setup()

    const report = blockchainMetadataReportDefinition.factory(deps)

    expect(report.namespace).toEqual('blockchainMetadata')
  })

  it('should gracefully handle when a wallet does not exist or locked', async () => {
    const deps = setup({
      enabledAssets: {
        ethereum: true,
        monero: true,
      },
    })

    const report = blockchainMetadataReportDefinition.factory(deps)
    expect(report.getSchema().parse(await report.export({ walletExists: false }))).toEqual(null)
    expect(
      report.getSchema().parse(await report.export({ walletExists: true, isLocked: true }))
    ).toEqual(null)
  })

  it('should report tx logs', async () => {
    const deps = setup({
      enabledAssets: {
        ethereum: true,
        monero: true,
      },
    })

    const report = blockchainMetadataReportDefinition.factory(deps)
    const result = report.getSchema().parse(await report.export({ walletExists: true }))

    expect(result.txLogs).toEqual(
      JSON.parse(
        JSON.stringify({
          exodus_0: {
            ethereum: txLogsData.exodus_0.ethereum
              .toRedactedJSON()
              .map((tx) => omit(tx, ['currencies'])),
            monero: [{ coinName: 'monero', send: true }],
          },
        })
      )
    )
  })

  it('should report account states', async () => {
    const evilAccountState = EthereumAccountState.create()
    evilAccountState.otherPrivateKey = 'boo'
    evilAccountState.stakingInfo = {
      balance: ethereumMeta.currency.defaultUnit(0),
      privateKey: 'uh oh',
    }

    const deps = setup({
      accountStates: {
        exodus_0: {
          ethereum: evilAccountState,
        },
      },
    })

    const report = blockchainMetadataReportDefinition.factory(deps)
    const result = report.getSchema().parse(await report.export({ walletExists: true }))

    expect(result.accountStates).toEqual({
      exodus_0: {
        ethereum: {
          cursor: '',
          balance: '0 ETH',
          stakingInfo: {
            balance: '0 ETH',
            privateKey: null,
          },
        },
      },
    })
  })

  it('should sanitize account states', async () => {
    const deps = setup()

    const report = blockchainMetadataReportDefinition.factory(deps)
    const result = report.getSchema().parse(await report.export({ walletExists: true }))

    expect(result.accountStates).toEqual({
      exodus_0: {
        ethereum: {
          cursor: '',
          balance: '0 ETH',
        },
        bitcoin: {
          balance: '0 BTC',
        },
      },
    })
  })

  it('should reject when tx logs could not be loaded', async () => {
    const { txLogsAtom, accountStatesAtom } = setup()

    const error = new Error('Could not load tx logs')
    jest.spyOn(txLogsAtom, 'get').mockRejectedValueOnce(error)

    const report = blockchainMetadataReportDefinition.factory({ txLogsAtom, accountStatesAtom })

    await expect(report.export({ walletExists: true })).rejects.toEqual(error)
  })

  it('should reject when account states could not be loaded', async () => {
    const { txLogsAtom, accountStatesAtom } = setup()

    const error = new Error('Could not load account states')
    jest.spyOn(accountStatesAtom, 'get').mockRejectedValueOnce(error)

    const report = blockchainMetadataReportDefinition.factory({ txLogsAtom, accountStatesAtom })

    await expect(report.export({ walletExists: true })).rejects.toEqual(error)
  })
})
