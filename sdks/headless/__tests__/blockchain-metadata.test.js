import { normalizeTxsJSON, TxSet } from '@exodus/models'
import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters/index.js'
import defaultConfig from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'
import TX_LOGS from './fixtures/tx-logs.js'

describe('blockchain-metadata', () => {
  let exodus
  let assetsModule
  let reportNode

  let port

  const passphrase = 'my-password-manager-generated-this'
  const assetName = 'bitcoin'
  const walletAccount = 'exodus_0'

  const setup = async ({ config = {}, createWallet = true } = {}) => {
    const adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config: { ...defaultConfig, ...config }, port })

    exodus = container.resolve()

    assetsModule = container.get('assetsModule')

    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
    }

    reportNode = container.getByType('report').blockchainMetadataReport

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

      await exodus.application.stop()
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

      await exodus.application.stop()
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

    afterEach(() => exodus.application.stop())

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

      await newExodus.application.stop()
    })
  })

  describe('reporting', () => {
    test('should successfully export report (pre-wallet-exists)', async () => {
      await setup({ createWallet: false })

      await expect(exodus.wallet.exists()).resolves.toBe(false)
      await expect(exodus.reporting.export()).resolves.toMatchObject({
        blockchainMetadata: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
      })

      await exodus.application.stop()
    })

    test('should successfully export report (post-wallet-exists)', async () => {
      await setup()

      await exodus.application.unlock({ passphrase })
      await expect(exodus.wallet.exists()).resolves.toBe(true)
      await expect(exodus.reporting.export()).resolves.toMatchObject({
        blockchainMetadata: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
      })

      await exodus.application.stop()
    })
  })
})
