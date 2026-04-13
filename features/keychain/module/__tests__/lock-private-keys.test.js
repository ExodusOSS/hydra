import { mnemonicToSeed } from '@exodus/bip39'
import KeyIdentifier from '@exodus/key-identifier'
import { createKeyIdentifierForExodus } from '@exodus/key-ids'

import { getSeedId } from '../crypto/seed-id.js'
import createKeychain from './create-keychain.js'

const seed = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease worth',
})

const seed1 = await mnemonicToSeed({
  mnemonic: 'menu memory fury language physical wonder dog valid smart edge decrease test',
  validate: false,
})

const otherSeed = await mnemonicToSeed({ mnemonic: 'language'.repeat(12), validate: false })

const seedId = await getSeedId(seed)
const otherSeedId = await getSeedId(otherSeed)

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

  it('should allow addSeed when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    await keychain.addSeed(seed)
  })

  it('should allow removeAllSeeds when locked', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.removeAllSeeds()
  })

  it('should allow usage when locked after removeAllSeeds and re-adding seeds', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()
    keychain.removeAllSeeds()
    await keychain.addSeed(seed)

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

  it('allows unlocking seeds in batches', async () => {
    const keychain = await createKeychain({ seed })
    await keychain.addSeed(otherSeed)

    keychain.lockPrivateKeys()
    await keychain.unlockPrivateKeys([seed])

    expect(await keychain.arePrivateKeysLocked()).toBe(true)
    expect(await keychain.arePrivateKeysLocked([seed])).toBe(false)

    await keychain.unlockPrivateKeys([otherSeed])
    expect(await keychain.arePrivateKeysLocked()).toBe(false)
  })

  it('should allow exportKeys after lock/unlock', async () => {
    const keychain = await createKeychain({ seed })

    keychain.lockPrivateKeys()
    await keychain.unlockPrivateKeys([seed])
    await keychain.addSeed(otherSeed)

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

  it('should block exporting seeds that still locked', async () => {
    const keychain = await createKeychain({ seed })
    const keyId = createKeyIdentifierForExodus({ exoType: 'FUSION' })

    await keychain.addSeed(otherSeed)
    keychain.lockPrivateKeys()
    await keychain.unlockPrivateKeys([seed])

    await expect(
      keychain.exportKey({
        seedId: otherSeedId,
        keyId,
        exportPrivate: true,
      })
    ).rejects.toThrow(/private keys are locked/)
  })

  it('should block unlock for wrong seed ids', async () => {
    const keychain = await createKeychain({ seed })
    keychain.lockPrivateKeys()

    const wrongSeed = await mnemonicToSeed({ mnemonic: 'menu'.repeat(12), validate: false })
    await expect(async () => keychain.unlockPrivateKeys([wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )

    const keychain1 = await createKeychain({ seed })
    await keychain1.addSeed(seed1)
    keychain1.lockPrivateKeys()
    await expect(async () => keychain1.unlockPrivateKeys([seed, wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )
  })

  it('either unlock all provided seeds or none', async () => {
    const keychain = await createKeychain({ seed })

    await keychain.addSeed(seed1)
    keychain.lockPrivateKeys()

    const wrongSeed = await mnemonicToSeed({ mnemonic: 'menu'.repeat(12), validate: false })
    await expect(async () => keychain.unlockPrivateKeys([seed, wrongSeed])).rejects.toThrow(
      /must pass in existing seed/
    )

    expect(await keychain.arePrivateKeysLocked([seed])).toBe(true)
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
})
