import personalNotes from '@exodus/personal-notes'
import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('wallet', () => {
  const passphrase = 'my-password-manager-generated-this'

  test('should clear atoms when clearing', async () => {
    const adapters = createAdapters()
    const port = adapters.port
    const initialContainer = createExodus({ adapters, config })
    initialContainer.use(personalNotes())

    const exodus = initialContainer.resolve()

    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'delete' } })

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
    await exodus.application.delete()
    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()
    const container = createExodus({ adapters: { ...adapters, port: newPort }, config })
    container.use(personalNotes())

    const newExodus = container.resolve()
    const atoms = container.getByType('atom')

    const newExodusStartPromise = newExodus.application.start()

    const clearedAtoms = []
    for (const id in atoms) {
      const atom = atoms[id]
      const set = atom.set
      const reset = atom.reset

      atom.set = async (value) => {
        if (
          value === undefined ||
          id === 'eventLogAtom' ||
          (typeof value === 'function' && value() === undefined)
        )
          clearedAtoms.push(id)

        return set(value)
      }

      atom.reset = async () => {
        clearedAtoms.push(id)
        return reset()
      }
    }

    await expectEvent({ port: newPort, event: 'clear' })

    expect(clearedAtoms).toEqual(
      expect.arrayContaining([
        'activeWalletAccountAtom',
        'autoLockTimerAtom',
        'backedUpAtom',
        'enabledAndDisabledAssetsAtom',
        'hardwareWalletPublicKeysAtom',
        'hasBalanceAtom',
        'languageAtom',
        'personalNotesAtom',
        'restoringAssetsAtom',
        'walletAccountsInternalAtom',
        'walletStartupCountAtom',
        ...(process.env.MULTI_PROCESS ? [] : ['seedMetadataAtom']),
      ])
    )

    await newExodusStartPromise
    await newExodus.application.stop()
    await exodus.application.stop()
  })
})
