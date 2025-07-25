import { createInMemoryAtom } from '@exodus/atoms'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import keychainDefinition from '@exodus/keychain/module/index.js'
import { WalletAccount } from '@exodus/models'
import { mnemonicToSeed } from 'bip39'

import analyticsExtraSeedsUserIdsAtomDefinition from '../extra-seeds-user-ids.js'

const { factory: createAnalyticsExtraSeedsUserIdsAtom } = analyticsExtraSeedsUserIdsAtomDefinition
const storage = {
  get: jest.fn(),
  set: jest.fn(),
}

const logger = { warn: jest.fn() }

describe('analyticsUserIdAtom', async () => {
  const seed1 = await mnemonicToSeed(
    'menu memory fury language physical wonder dog valid smart edge decrease worth'
  )
  const seed2 = await mnemonicToSeed(
    'grass custom warm saddle side clerk envelope artist ankle window people doctor'
  )
  const seed3 = await mnemonicToSeed(
    'buffalo hero bridge wheat rent flee office mimic tennis estate toy sheriff'
  )
  const seedId1 = getSeedId(seed1)
  const seedId2 = getSeedId(seed2)
  const seedId3 = getSeedId(seed3)

  let extraSeedsUserIdsAtom
  let primarySeedIdAtom
  let keychain

  beforeEach(() => {
    const lockedAtom = createInMemoryAtom({ defaultValue: false })
    const enabledWalletAccountsAtom = createInMemoryAtom({
      defaultValue: {
        exodus_0: { seedId: seedId1, source: WalletAccount.EXODUS_SRC },
        seed_account_0_0: { seedId: seedId2, source: WalletAccount.SEED_SRC },
        seed_account_1_0: { seedId: seedId3, source: WalletAccount.SEED_SRC },
        seed_account_1_1: { seedId: seedId3, source: WalletAccount.SEED_SRC },
        hardware_wallet_account: { source: WalletAccount.TREZOR_SRC },
      },
    })
    primarySeedIdAtom = createInMemoryAtom({ defaultValue: seedId1 })

    keychain = keychainDefinition.factory()
    keychain.addSeed(seed1)
    keychain.addSeed(seed2)
    keychain.addSeed(seed3)

    extraSeedsUserIdsAtom = createAnalyticsExtraSeedsUserIdsAtom({
      storage,
      keychain,
      lockedAtom,
      primarySeedIdAtom,
      enabledWalletAccountsAtom,
      logger,
      config: { keyIdentifier: EXODUS_KEY_IDS.TELEMETRY },
    })

    jest.resetAllMocks()
  })

  describe('get', () => {
    test('returns seed derived user id', async () => {
      await expect(extraSeedsUserIdsAtom.get()).resolves.toEqual({
        '3c4d2f1c13332c084d3be1f593c90f51a9904da9': 'LSzTGsrAzmq/Zxi295e74hINgNTgqcTFgs3uDe/o8o8=',
        ba41ba1370cd8d281ab8f24d49072d997440d030: 'x6FwKEq0Ul+YBZVsaSSF54pF2pf+Judaq8+fXDTcECY=',
      })
    })

    test('returns seed derived user id', async () => {
      await expect(extraSeedsUserIdsAtom.get()).resolves.toEqual({
        '3c4d2f1c13332c084d3be1f593c90f51a9904da9': 'LSzTGsrAzmq/Zxi295e74hINgNTgqcTFgs3uDe/o8o8=',
        ba41ba1370cd8d281ab8f24d49072d997440d030: 'x6FwKEq0Ul+YBZVsaSSF54pF2pf+Judaq8+fXDTcECY=',
      })
    })
  })

  describe('observe', () => {
    test('returns seed derived user id', async () => {
      const listener = jest.fn()
      extraSeedsUserIdsAtom.observe(listener)

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(listener).toHaveBeenCalledWith({
        '3c4d2f1c13332c084d3be1f593c90f51a9904da9': 'LSzTGsrAzmq/Zxi295e74hINgNTgqcTFgs3uDe/o8o8=',
        ba41ba1370cd8d281ab8f24d49072d997440d030: 'x6FwKEq0Ul+YBZVsaSSF54pF2pf+Judaq8+fXDTcECY=',
      })
    })

    test('triggers listener when an input value changes', async () => {
      const listener = jest.fn()
      extraSeedsUserIdsAtom.observe(listener)

      await new Promise((resolve) => setTimeout(resolve, 0))
      listener.mockClear()

      primarySeedIdAtom.set(seedId2)
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(listener).toHaveBeenCalledWith({
        '3c4d2f1c13332c084d3be1f593c90f51a9904da9': 'LSzTGsrAzmq/Zxi295e74hINgNTgqcTFgs3uDe/o8o8=',
      })
    })
  })
})
