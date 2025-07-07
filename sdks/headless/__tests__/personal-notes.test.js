import personalNotes from '@exodus/personal-notes'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('personal-notes', () => {
  const passphrase = 'my-password-manager-generated-this'

  test('should emit personal-notes', async () => {
    const adapters = createAdapters()
    const port = adapters.port

    const expectPersonalNotes = expectEvent({ port, event: 'personalNotes' })
    const container = createExodus({ adapters, config })
    container.use(personalNotes())
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await expectPersonalNotes

    await exodus.application.stop()
  })
})
