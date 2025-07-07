import { EXODUS_KEY_IDS } from '@exodus/key-ids'

import createExodus from './exodus.js'

describe('cached sodium encryptor', () => {
  let exodus

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    const container = createExodus()

    exodus = container.resolve()

    await exodus.application.start()
  })

  afterEach(() => exodus.application.stop())

  test('encrypts payload', async () => {
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
    const seedId = await exodus.wallet.getPrimarySeedId()

    const data = Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8')
    const key = await exodus.cachedSodiumEncryptor.encryptSecretBox({
      seedId,
      keyId: EXODUS_KEY_IDS.FUSION,
      data,
    })

    expect(key).toBeInstanceOf(Buffer)
    expect(Buffer.compare(key, data)).not.toBe(0)
  })
})
