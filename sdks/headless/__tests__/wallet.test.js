import { mnemonicToSeed } from '@exodus/bip39'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('wallet', async () => {
  let exodus
  let adapters = createAdapters()
  let port
  let primarySeedIdAtom

  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
  const passphrase = 'my-password-manager-generated-this'
  const seed = await mnemonicToSeed({ mnemonic })
  const seedId = await getSeedId(seed)

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()
    primarySeedIdAtom = container.get('primarySeedIdAtom')

    await expect(exodus.wallet.exists()).resolves.toBe(false)
  })

  test('should create a new wallet', async () => {
    await exodus.application.start()
    await exodus.application.create({ passphrase })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await expect(exodus.application.unlock({ passphrase: 'other' })).rejects.toThrow(
      'Wrong password. Try again.'
    )

    await exodus.application.unlock({ passphrase })

    await expect(exodus.application.getMnemonic({ passphrase: 'other' })).rejects.toThrow(
      'Wrong password. Try again.'
    )

    const mnemonic = await exodus.application.getMnemonic({ passphrase })

    expect(mnemonic.split(' ').length).toBe(12)

    await exodus.application.stop()
  })

  test('should ingest primary seed id', async () => {
    await exodus.application.start()
    await exodus.application.import({ mnemonic })
    await exodus.application.unlock()

    await expect(primarySeedIdAtom.get()).resolves.toBe(seedId)

    await exodus.application.stop()
  })

  test('should load existing wallet', async () => {
    await exodus.application.start()
    await exodus.application.import({ mnemonic })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    // Simulate new wallet after restart
    const newPort = new Emitter()

    newPort.subscribe(({ type }) => {
      if (type === 'clear') throw new Error('unexpected "clear"')
    })

    const expectStartPromise = expectEvent({
      event: 'start',
      port: newPort,
    })

    const newExodus = createExodus({ adapters: { ...adapters, port: newPort }, config }).resolve()

    await newExodus.application.start()

    await expect(newExodus.wallet.exists()).resolves.toBe(true)

    await expectStartPromise

    await newExodus.application.stop()
    await exodus.application.stop()
  })

  test('should import an existing wallet', async () => {
    await exodus.application.start()

    await exodus.application.import({ passphrase, mnemonic })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await exodus.application.unlock({ passphrase })

    await expect(exodus.application.getMnemonic({ passphrase })).resolves.toBe(mnemonic)

    await exodus.application.stop()
  })

  test('should import an existing wallet forcing restart', async () => {
    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'import' } })

    await exodus.application.start()
    await exodus.application.import({ passphrase, mnemonic, forceRestart: true })

    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()

    const newContainer = createExodus({ adapters: { ...adapters, port: newPort }, config })
    const newExodus = newContainer.resolve()

    const expectStart = expectEvent({ port: newPort, event: 'start' })

    await newExodus.application.start()
    await expectStart

    await expect(newExodus.wallet.exists()).resolves.toBe(true)

    const { backedUpAtom } = newContainer.getByType('atom')
    await expect(backedUpAtom.get()).resolves.toBe(true)

    await newExodus.application.stop()
    await exodus.application.stop()
  })

  test('should restore a wallet', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'import' } })

    await exodus.application.start()

    await exodus.application.create({ passphrase })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await exodus.application.unlock({ passphrase })

    await expect(exodus.application.getMnemonic({ passphrase })).resolves.not.toBe(mnemonic)

    await exodus.application.import({ passphrase, mnemonic })

    await expect(exodus.application.getMnemonic({ passphrase })).resolves.toBe(mnemonic)

    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()

    const newExodus = createExodus({ adapters: { ...adapters, port: newPort }, config }).resolve()
    const expectClear = expectEvent({ port: newPort, event: 'clear' })
    const expectStart = expectEvent({ port: newPort, event: 'start' })

    await newExodus.application.start()

    await expectClear

    const startPayload = await expectStart

    expect(startPayload).toMatchObject({ isRestoring: true })

    await expect(newExodus.wallet.exists()).resolves.toBe(true)

    await newExodus.application.stop()
    await exodus.application.stop()
  })

  test('should change passphrase', async () => {
    await exodus.application.start()

    await exodus.application.create({ passphrase })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await exodus.application.unlock({ passphrase })

    await expect(
      exodus.application.changePassphrase({
        currentPassphrase: 'other',
        newPassphrase: 'some-other',
      })
    ).rejects.toThrow('Wrong password. Try again.')

    await exodus.application.changePassphrase({
      currentPassphrase: passphrase,
      newPassphrase: 'other',
    })

    await exodus.application.unlock({ passphrase: 'other' })

    await exodus.application.stop()
  })

  test('should lock wallet', async () => {
    await exodus.application.start()

    await exodus.application.create({ passphrase })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await expect(exodus.wallet.isLocked()).resolves.toBe(true)

    await exodus.application.unlock({ passphrase })

    await expect(exodus.wallet.isLocked()).resolves.toBe(false)

    await exodus.application.stop()
  })

  test('should delete wallet', async () => {
    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'delete' } })

    await exodus.application.start()

    await exodus.application.create({ passphrase })

    await expect(exodus.wallet.exists()).resolves.toBe(true)

    await exodus.application.unlock({ passphrase })

    await exodus.application.delete()

    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()

    const newExodus = createExodus({ adapters: { ...adapters, port: newPort }, config }).resolve()
    const expectClear = expectEvent({ port: newPort, event: 'clear' })
    const expectStart = expectEvent({ port: newPort, event: 'start' })

    await newExodus.application.start()
    await expectClear
    await expectStart

    await expect(newExodus.wallet.exists()).resolves.toBe(false)

    await newExodus.application.stop()
    await exodus.application.stop()
  })

  test('it should emit "add-seed" over the port', async () => {
    await exodus.application.start()
    await exodus.application.import({ mnemonic })
    await exodus.application.unlock()

    const expectAddSeedEvent = expectEvent({ port, event: 'add-seed' })
    exodus.wallet.addSeed({
      mnemonic: 'excuse fly local lyrics tattoo hub way range globe put supreme glass',
    })

    await expectAddSeedEvent

    await exodus.application.stop()
  })

  test('import sets compatibility mode and seed id on default wallet account', async () => {
    const compatibilityMode = 'metamask'

    await exodus.application.start()
    await exodus.application.import({ mnemonic, compatibilityMode })
    await exodus.wallet.unlock()

    const enabledAccounts = await exodus.walletAccounts.getEnabled()
    expect(enabledAccounts).toMatchObject({
      exodus_0: expect.objectContaining({ compatibilityMode, seedId }),
    })

    await exodus.application.stop()
  })

  test('create sets seed id on default wallet account', async () => {
    await exodus.application.start()
    await exodus.application.create({ mnemonic })
    await exodus.application.unlock()

    const enabledAccounts = await exodus.walletAccounts.getEnabled()
    expect(enabledAccounts).toMatchObject({
      exodus_0: expect.objectContaining({ seedId }),
    })

    await exodus.application.stop()
  })
})
