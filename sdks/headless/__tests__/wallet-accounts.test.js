import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import { WalletAccount } from '@exodus/models'
import Emitter from '@exodus/wild-emitter'
import { mnemonicToSeed } from 'bip39'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

describe('wallet-accounts', () => {
  /** @type {import('../src/index').ExodusApi} */
  let exodus
  let adapters
  let port

  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
  const otherMnemonic = 'excuse fly local lyrics tattoo hub way range globe put supreme glass'
  const seed = mnemonicToSeed(mnemonic)
  const seedId = getSeedId(seed)
  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.import({ mnemonic, passphrase })
    await exodus.application.unlock({ passphrase })
  })

  test('should default to 1 walletAccount', async () => {
    await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
      [WalletAccount.DEFAULT_NAME]: new WalletAccount({
        ...WalletAccount.DEFAULT,
        seedId,
      }),
    })
  })

  test('walletAccounts.create', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })
    const { exodus_1: created } = await exodus.walletAccounts.getEnabled()
    expect(created).toBeDefined()
  })

  test('walletAccounts.disable', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })
    let enabled = await exodus.walletAccounts.getEnabled()
    expect(enabled.exodus_1).toBeDefined()
    await exodus.walletAccounts.disable('exodus_1')
    enabled = await exodus.walletAccounts.getEnabled()
    expect(enabled.exodus_1).toBeUndefined()
  })

  test("can't disable default walletAccount", async () => {
    await expect(exodus.walletAccounts.disable(WalletAccount.DEFAULT_NAME)).rejects.toThrow()
  })

  test('walletAccounts.enable', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })
    await exodus.walletAccounts.disable('exodus_1')
    let enabled = await exodus.walletAccounts.getEnabled()
    expect(enabled.exodus_1).toBeUndefined()
    await exodus.walletAccounts.enable('exodus_1')
    enabled = await exodus.walletAccounts.getEnabled()
    expect(enabled.exodus_1).toBeDefined()
  })

  test('walletAccounts.update', async () => {
    const label = 'icoium makemerichius'
    await exodus.walletAccounts.update(WalletAccount.DEFAULT_NAME, { label })
    const enabled = await exodus.walletAccounts.getEnabled()
    expect(enabled[WalletAccount.DEFAULT_NAME].label).toEqual(label)
  })

  test('hardware walletAccounts', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.TREZOR_SRC, id: 1 })
    const enabled = await exodus.walletAccounts.getEnabled()
    const trezor = Object.values(enabled).find(
      (w) => w.id === 1 && w.source === WalletAccount.TREZOR_SRC
    )

    expect(trezor.isHardware).toEqual(true)
  })

  test('custodial walletAccounts', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.FTX_SRC, id: 1 })
    const enabled = await exodus.walletAccounts.getEnabled()
    const ftx = Object.values(enabled).find((w) => w.id === 1 && w.source === WalletAccount.FTX_SRC)
    expect(ftx.isCustodial).toEqual(true)
  })

  test('should delete walletAccounts on delete wallet', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })
    const initialEnabledAccounts = await exodus.walletAccounts.getEnabled()
    expect(Object.keys(initialEnabledAccounts).length).toEqual(2)
    await expect(Object.keys(initialEnabledAccounts)).toEqual([
      WalletAccount.DEFAULT_NAME,
      'exodus_1',
    ])
    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'delete' } })

    await exodus.application.delete()

    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()

    const newExodus = createExodus({ adapters: { ...adapters, port: newPort }, config }).resolve()
    const expectStart = expectEvent({ port: newPort, event: 'start' })

    await newExodus.application.start()
    await expectStart
    await newExodus.application.import({ mnemonic, passphrase })
    await newExodus.application.unlock({ passphrase })

    const enabledAccounts = await newExodus.walletAccounts.getEnabled()
    expect(Object.keys(enabledAccounts).length).toEqual(1)
    await expect(Object.keys(enabledAccounts)[0]).toEqual(WalletAccount.DEFAULT_NAME)
  })

  test('addSeed should auto-create a walletAccount', async () => {
    exodus.wallet.addSeed({ mnemonic: otherMnemonic, compatibilityMode: 'metamask' })
    await expectEvent({ port, event: 'add-seed' })

    await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
      exodus_0: expect.objectContaining({
        enabled: true,
        index: 0,
        seedId: 'c3d6347aa044325cbad76c524f1b3cacda024c3c',
        source: 'exodus',
      }),
      seed_0_dd3986b4a4af4315e614e08cb9a62707b854cddb_metamask: expect.objectContaining({
        compatibilityMode: 'metamask',
        enabled: true,
        index: 0,
        seedId: 'dd3986b4a4af4315e614e08cb9a62707b854cddb',
        source: 'seed',
      }),
    })
  })

  test('create updates seedId on default wallet account', async () => {
    const container = createExodus({ adapters: createAdapters(), config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ passphrase, mnemonic })
    await exodus.application.unlock({ passphrase })

    await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
      exodus_0: expect.objectContaining({
        seedId: 'c3d6347aa044325cbad76c524f1b3cacda024c3c',
      }),
    })
  })
})
