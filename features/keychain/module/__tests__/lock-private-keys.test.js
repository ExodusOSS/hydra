import { mnemonicToSeed } from '@exodus/bip39'
import KeyIdentifier from '@exodus/key-identifier'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'

import { getSeedId } from '../crypto/seed-id.js'
import moduleDefinition from '../index.js'
import createKeychain from './create-keychain.js'

const seed = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
})

const seedId = await getSeedId(seed)

describe('lockPrivateKeys', () => {
  it('should allow private key usage when unlocked', async () => {
    const keychain = await createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })

    // Public keys should be the same
    const sodiumEncryptor = keychain.sodium.createEncryptor({ keyId })
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should allow unlock when locked', async () => {
    const keychain = moduleDefinition.factory()
    keychain.lockPrivateKeys()
    await keychain.unlock(seed)
  })

  it('should allow lock when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.lock()
  })

  it('should allow usage when locked after lock and re-adding seeds', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.lock()
    await keychain.unlock(seed)

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })
  })

  it('should allow exportKey for public keys when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
    })

    expect(exportedKeys.publicKey).toBeDefined()
  })

  it('reports lock state via arePrivateKeysLocked', async () => {
    const keychain = await createKeychain({ seed })

    expect(await keychain.arePrivateKeysLocked()).toBe(false)

    keychain.lockPrivateKeys()
    expect(await keychain.arePrivateKeysLocked()).toBe(true)

    await keychain.unlockPrivateKeys()
    expect(await keychain.arePrivateKeysLocked()).toBe(false)
  })

  it('lock resets lock state', async () => {
    const keychain = await createKeychain({ seed })

    keychain.lockPrivateKeys()
    expect(await keychain.arePrivateKeysLocked()).toBe(true)

    keychain.lock()
    expect(await keychain.arePrivateKeysLocked()).toBe(false)
  })

  it('should allow exportKeys after lock/unlock', async () => {
    const keychain = await createKeychain({ seed })

    keychain.lockPrivateKeys()
    await keychain.unlockPrivateKeys()

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    const exportedKeys = await keychain.exportKey({
      seedId,
      keyId,
      exportPrivate: true,
    })

    // Public keys should be the same
    const sodiumEncryptor = keychain.sodium.createEncryptor({ keyId })
    const {
      sign: { publicKey },
    } = await sodiumEncryptor.getSodiumKeysFromSeed({ seedId })
    expect(Buffer.compare(publicKey, exportedKeys.publicKey)).toBe(0)
  })

  it('should block exportKey for private keys when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await expect(
      keychain.exportKey({
        seedId,
        keyId,
        exportPrivate: true,
      })
    ).rejects.toThrow(/private keys are locked/)
  })

  it('should block signBuffer when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    const keyId = {
      keyType: 'nacl',
    }
    await expect(
      keychain.signBuffer({ data: new Uint8Array([0]), keyId, signatureType: 'ed25519' })
    ).rejects.toThrow(/private keys are locked/)
  })

  it('should block sodium when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.sodium.getSodiumKeysFromSeed({})).rejects.toThrow(
      /private keys are locked/
    )
    await expect(keychain.sodium.createEncryptor({}).getSodiumKeysFromSeed({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block ed25519 when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()

    const keyId = new KeyIdentifier({
      derivationPath: 'm/0', // doesn't matter in this fixture as we don't use it
      derivationAlgorithm: 'SLIP10',
    })

    await expect(keychain.ed25519.signBuffer({ keyId })).rejects.toThrow(/private keys are locked/)
    await expect(keychain.ed25519.createSigner({ keyId }).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('should block secp256k1 when locked', async () => {
    const keyId = new KeyIdentifier({
      derivationPath: 'm/0', // doesn't matter in this fixture as we don't use it
      derivationAlgorithm: 'BIP32',
    })

    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    await expect(keychain.secp256k1.signBuffer({ keyId })).rejects.toThrow(
      /private keys are locked/
    )
    await expect(keychain.secp256k1.createSigner({ keyId }).signBuffer({})).rejects.toThrow(
      /private keys are locked/
    )
  })

  it('is idempotent when unlocking the same seed', async () => {
    const keychain = moduleDefinition.factory()
    const first = await keychain.unlock(seed)

    await expect(keychain.unlock(seed)).resolves.toBe(first)
  })

  it('re-unlocking the same seed clears the private-keys lock', async () => {
    const keychain = moduleDefinition.factory()
    await keychain.unlock(seed)
    keychain.lockPrivateKeys()
    expect(await keychain.arePrivateKeysLocked()).toBe(true)

    await keychain.unlock(seed)
    expect(await keychain.arePrivateKeysLocked()).toBe(false)

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await expect(keychain.exportKey({ seedId, keyId, exportPrivate: true })).resolves.toBeDefined()
  })

  it('replaces the current seed when unlocking a different one (last-write-wins)', async () => {
    const otherSeed = await mnemonicToSeed({
      mnemonic: 'wine system mean beyond filter human meat rubber episode wash stomach aunt',
    })
    const otherSeedId = await getSeedId(otherSeed)
    const keychain = moduleDefinition.factory()
    await keychain.unlock(seed)

    await expect(keychain.unlock(otherSeed)).resolves.toBe(otherSeedId)

    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    // the new seed is usable...
    await expect(
      keychain.exportKey({ seedId: otherSeedId, keyId, exportPrivate: true })
    ).resolves.toBeDefined()
    // ...and the replaced seed is gone.
    await expect(keychain.exportKey({ seedId, keyId, exportPrivate: true })).rejects.toThrow(
      /not initialized/
    )
  })

  it('serializes concurrent unlocks so the last seed wins without interleaving', async () => {
    const otherSeed = await mnemonicToSeed({
      mnemonic: 'wine system mean beyond filter human meat rubber episode wash stomach aunt',
    })
    const otherSeedId = await getSeedId(otherSeed)
    const keychain = moduleDefinition.factory()

    const [first, second] = await Promise.allSettled([
      keychain.unlock(seed),
      keychain.unlock(otherSeed),
    ])

    expect(first.status).toBe('fulfilled')
    expect(second.status).toBe('fulfilled')

    // Serialized FIFO: the second (otherSeed) ran last and is the surviving seed;
    // the keychain holds exactly one hard seed, never a corrupted blend of both.
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })
    await expect(
      keychain.exportKey({ seedId: otherSeedId, keyId, exportPrivate: true })
    ).resolves.toBeDefined()
    await expect(keychain.exportKey({ seedId, keyId, exportPrivate: true })).rejects.toThrow(
      /not initialized/
    )
  })
})
