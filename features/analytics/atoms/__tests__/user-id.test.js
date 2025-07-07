import { createInMemoryAtom } from '@exodus/atoms'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import keychainDefinition from '@exodus/keychain/module/index.js'
import { mnemonicToSeed } from 'bip39'

import analyticsUserIdAtomDefinition from '../user-id.js'

const { factory: createUserIdAtom } = analyticsUserIdAtomDefinition
const storage = {
  get: jest.fn(),
  set: jest.fn(),
}

const logger = { warn: jest.fn() }

describe('analyticsUserIdAtom', async () => {
  const seed = await mnemonicToSeed(
    'menu memory fury language physical wonder dog valid smart edge decrease worth'
  )
  const seedId = getSeedId(seed)
  const expectedAnalyticsId = '7qtsnoYe2fOn95F/bZcgMuPk16Qz62vDD0tIjuE2gsc='

  let userIdAtom
  let keychain

  beforeEach(() => {
    const lockedAtom = createInMemoryAtom({ defaultValue: false })
    const primarySeedIdAtom = createInMemoryAtom({ defaultValue: seedId })

    keychain = keychainDefinition.factory()
    keychain.addSeed(seed)

    userIdAtom = createUserIdAtom({
      storage,
      keychain,
      lockedAtom,
      primarySeedIdAtom,
      logger,
      config: { keyIdentifier: EXODUS_KEY_IDS.TELEMETRY },
    })

    jest.resetAllMocks()
  })

  test('returns seed derived user id', async () => {
    await expect(userIdAtom.get()).resolves.toBe(expectedAnalyticsId)
  })
})
