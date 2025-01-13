import { normalizeTxsJSON, TxSet } from '@exodus/models'
import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters'
import defaultConfig from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'
import TX_LOGS from './fixtures/tx-logs'

describe('blockchain-metadata', () => {
  let exodus
  let assetsModule

  let port

  const passphrase = 'my-password-manager-generated-this'
  const assetName = 'bitcoin'
  const walletAccount = 'exodus_0'

  const setup = async ({ config = {} } = {}) => {
    const adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config: { ...defaultConfig, ...config }, port })

    exodus = container.resolve()

    assetsModule = container.get('assetsModule')

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })

    return { adapters }
  }

  describe('port', () => {
    it('should emit unserialized account states', async () => {
      await setup()

      const AccountState = assetsModule.getAsset(assetName).api.createAccountState()

      const initialEvent = expectEvent({
        port,
        event: 'accountStates',
        payload: {
          value: {
            exodus_0: expect.objectContaining({
              bitcoin: AccountState.create({ cursor: '' }),
            }),
          },
        },
      })

      await exodus.application.unlock({ passphrase })

      await initialEvent

      const updateEvent = expectEvent({
        port,
        event: 'accountStates',
        payload: {
          changes: {
            exodus_0: expect.objectContaining({
              bitcoin: AccountState.create({ cursor: 'updated-cursor' }),
            }),
          },
        },
      })

      await exodus.blockchainMetadata.updateAccountState({
        assetName,
        walletAccount,
        newData: { cursor: 'updated-cursor' },
      })

      await updateEvent
    })

    it('should emit tx logs', async () => {
      await setup()

      const txLogs = normalizeTxsJSON({ json: TX_LOGS.bitcoin, assets: assetsModule.getAssets() })

      const initialEvent = expectEvent({
        port,
        event: 'txLogs',
        predicate: (payload) => payload.value.exodus_0.bitcoin.equals(TxSet.fromArray([txLogs[0]])),
      })

      exodus.blockchainMetadata.updateTxs({
        assetName,
        walletAccount,
        txs: [txLogs[0]],
      })

      await exodus.application.unlock({ passphrase })

      await initialEvent

      const updatedTx = { ...txLogs[0], confirmations: 2 }
      const updateEvent = expectEvent({
        port,
        event: 'txLogs',
        predicate: ({ changes }) => changes.exodus_0.bitcoin.equals(TxSet.fromArray([updatedTx])),
      })

      await exodus.blockchainMetadata.updateTxs({
        assetName,
        walletAccount,
        txs: [updatedTx],
      })

      await updateEvent
    })
  })

  describe('wallet.delete', () => {
    let whenRestarted
    let adapters

    beforeEach(async () => {
      ;({ adapters } = await setup())

      await exodus.application.unlock({ passphrase })

      whenRestarted = expectEvent({ port, event: 'restart', payload: { reason: 'delete' } })
    })

    it('should reset account state and tx logs', async () => {
      const AccountState = assetsModule.getAsset(assetName).api.createAccountState()

      const txLogs = normalizeTxsJSON({ json: TX_LOGS.bitcoin, assets: assetsModule.getAssets() })

      await exodus.blockchainMetadata.updateAccountState({
        assetName,
        walletAccount,
        newData: { cursor: 'some-cursor' },
      })

      await exodus.blockchainMetadata.updateTxs({
        assetName,
        walletAccount,
        txs: [txLogs[0]],
      })

      await exodus.application.delete()
      await whenRestarted

      const newPort = new Emitter()
      const newExodus = createExodus({
        adapters: { ...adapters, port: newPort },
        config: defaultConfig,
      }).resolve()

      const whenStarted = expectEvent({ port: newPort, event: 'start' })

      await newExodus.application.start()
      await newExodus.application.load()
      await newExodus.application.create({ passphrase })
      await newExodus.application.unlock({ passphrase })
      await whenStarted

      expect(
        await newExodus.blockchainMetadata.getAccountState({ assetName, walletAccount })
      ).toEqual(AccountState.create())
      expect(await newExodus.blockchainMetadata.getTxLog({ assetName, walletAccount })).toEqual(
        TxSet.EMPTY
      )
    })
  })
})
