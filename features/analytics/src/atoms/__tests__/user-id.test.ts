import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { getSeedId } from '@exodus/bip32'
import { mnemonicToSeed } from '@exodus/bip39'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import type { Keychain } from '@exodus/keychain'
import keychainFactory from '@exodus/keychain'

import analyticsUserIdAtomDefinition from '../user-id.js'

const { factory: createUserIdAtom } = analyticsUserIdAtomDefinition

type FactoryArgs = Parameters<typeof createUserIdAtom>[0]

const storage = {
  get: jest.fn(),
  set: jest.fn(),
} as unknown as FactoryArgs['storage']

const logger = { warn: jest.fn() } as unknown as FactoryArgs['logger']

describe('analyticsUserIdAtom', async () => {
  const seed = await mnemonicToSeed({
    mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
  })
  const seedId = await getSeedId(seed)
  const expectedAnalyticsId = '7qtsnoYe2fOn95F/bZcgMuPk16Qz62vDD0tIjuE2gsc='

  let userIdAtom: Atom<string>
  let keychain: Keychain

  beforeEach(async () => {
    const lockedAtom = createInMemoryAtom({ defaultValue: false })
    const primarySeedIdAtom = createInMemoryAtom({ defaultValue: seedId })

    const { definition } = keychainFactory().definitions.find(
      ({ definition }) => definition.id === 'keychain'
    )!
    if (definition.id !== 'keychain') throw new Error('expected keychain module definition')
    keychain = definition.factory()
    await keychain.unlock(seed)

    userIdAtom = createUserIdAtom({
      storage,
      keychain: keychain as unknown as FactoryArgs['keychain'],
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
