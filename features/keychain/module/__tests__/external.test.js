import { hash } from '@exodus/crypto/hash'

import keychainDefinition, { KeyIdentifier } from '../index.js'

const PRIVATE_KEY = Buffer.from(
  'bb42809079e6564ec7e45af4d6a8fb8c5edc9373d8585b86f62f46ec7aa41729',
  'hex'
)

const data = await hash('sha256', Buffer.from('I really love keychains'))

const keyId = new KeyIdentifier({
  // must match in `addExternalPrivateKey` and subsequence `signBuffer`, but not actually used for derivation
  derivationPath: "m/44'/60'/0'/0/0",
  derivationAlgorithm: 'BIP32',
  keyType: 'nacl',
})

const setup = async () => {
  const keychain = keychainDefinition.factory({
    logger: console,
    legacyPrivToPub: Object.create(null),
  })
  const seedId = await keychain.addExternalPrivateKey({ privateKey: PRIVATE_KEY, keyId })

  return { keychain, seedId }
}

test('signBuffer', async () => {
  const { keychain, seedId } = await setup()

  const signatureType = 'ed25519'
  const expected =
    'd0f019e45795a86d79542143483e22a2478498289490072c902408c01744f81d2d7769c7b6c5c28ade5336d20ea8b39c3723264d1d271a24a15dca509e3d5f03'

  const signature = await keychain.signBuffer({ seedId, keyId, signatureType, data })

  expect(signature.toString('hex')).toBe(expected)
})

test('signBuffer with different signatureType', async () => {
  const { keychain, seedId } = await setup()

  const signatureType = 'ecdsa'

  await expect(async () =>
    keychain.signBuffer({ seedId, keyId, signatureType, data })
  ).rejects.toThrow('"keyId.keyType" nacl does not support "signatureType" ecdsa')
})

test('signBuffer with different keyId.keyType', async () => {
  const { keychain, seedId } = await setup()

  const signatureType = 'ed25519'
  const invalidKeyId = new KeyIdentifier({ ...keyId, keyType: 'secp256k1' })

  await expect(async () =>
    keychain.signBuffer({ seedId, keyId: invalidKeyId, signatureType, data })
  ).rejects.toThrow('"keyId.keyType" secp256k1 does not support "signatureType" ed25519')
})

test('signBuffer with different keyId.derivationAlgorithm', async () => {
  const { keychain, seedId } = await setup()

  const signatureType = 'ed25519'
  const invalidKeyId = new KeyIdentifier({ ...keyId, derivationAlgorithm: 'SLIP10' })

  await expect(async () =>
    keychain.signBuffer({ seedId, keyId: invalidKeyId, signatureType, data })
  ).rejects.toThrow('#getPrivateHDKey: found no valid master seed')
})

test('signBuffer with different keyId.derivationPath', async () => {
  const { keychain, seedId } = await setup()

  const signatureType = 'ed25519'
  const invalidKeyId = new KeyIdentifier({ ...keyId, derivationPath: 'm/0/0' })

  await expect(async () =>
    keychain.signBuffer({ seedId, keyId: invalidKeyId, signatureType, data })
  ).rejects.toThrow(
    'derive: unable to derive path specified in key identifier for external private key'
  )
})

test('exportKey', async () => {
  const { keychain, seedId } = await setup()

  // { xpub, publicKey }
  const publicKey = await keychain.exportKey({ seedId, keyId })
  // { xpub, xpriv, publicKey, privateKey }
  const privateKey = await keychain.exportKey({ seedId, keyId, exportPrivate: true })

  expect(publicKey.publicKey).toEqual(
    Buffer.from('2fd4a7e5a2b64d30fc0c69d3b2b14ad1d0b7c000f7619104359cca64f9fb1281', 'hex')
  )
  expect(publicKey.xpriv).toBeFalsy()
  expect(publicKey.privateKey).toBeFalsy()

  expect(privateKey).toEqual({
    ...publicKey,
    xpriv: null,
    privateKey: Buffer.from(
      'bb42809079e6564ec7e45af4d6a8fb8c5edc9373d8585b86f62f46ec7aa41729',
      'hex'
    ),
  })
})

test('removeExternalPrivateKey and getPublicKey', async () => {
  const { keychain, seedId } = await setup()

  await keychain.removeExternalPrivateKey(seedId)
  await expect(async () => keychain.getPublicKey({ seedId, keyId })).rejects.toThrow(
    `seed with id "${seedId}" is not initialized`
  )
})

test('removeExternalPrivateKey and exportKey', async () => {
  const { keychain, seedId } = await setup()

  await keychain.removeExternalPrivateKey(seedId)
  await expect(async () => keychain.exportKey({ seedId, keyId })).rejects.toThrow(
    `seed with id "${seedId}" is not initialized`
  )
  await expect(async () =>
    keychain.exportKey({ seedId, keyId, exportPrivate: true })
  ).rejects.toThrow(`seed with id "${seedId}" is not initialized`)
})

test('removeExternalPrivateKey and signBuffer', async () => {
  const { keychain, seedId } = await setup()

  await keychain.removeExternalPrivateKey(seedId)
  await expect(async () =>
    keychain.signBuffer({ seedId, keyId, signatureType: 'ed25519', data })
  ).rejects.toThrow(`seed with id "${seedId}" is not initialized`)
})

test('addExternalPrivateKey produces different seedIds for different derivationAlgorithms', async () => {
  const keychain = keychainDefinition.factory({
    logger: console,
    legacyPrivToPub: Object.create(null),
  })

  const keychain2 = keychainDefinition.factory({
    logger: console,
    legacyPrivToPub: Object.create(null),
  })

  const keyIdBIP32 = new KeyIdentifier({
    derivationPath: "m/44'/501'/0'/0'",
    derivationAlgorithm: 'BIP32',
    keyType: 'nacl',
  })

  const keyIdSLIP10 = new KeyIdentifier({
    derivationPath: "m/44'/501'/0'/0'",
    derivationAlgorithm: 'SLIP10',
    keyType: 'nacl',
  })

  const seedIdBIP32 = await keychain.addExternalPrivateKey({
    privateKey: PRIVATE_KEY,
    keyId: keyIdBIP32,
  })
  const seedIdSLIP10 = await keychain.addExternalPrivateKey({
    privateKey: PRIVATE_KEY,
    keyId: keyIdSLIP10,
  })

  // The seed IDs should be different because derivationAlgorithm is used in the hash
  expect(seedIdBIP32).not.toBe(seedIdSLIP10)

  // The seed IDs should be the same when using the same derivationAlgorithm
  const seedIdBIP32Again = await keychain2.addExternalPrivateKey({
    privateKey: PRIVATE_KEY,
    keyId: keyIdBIP32,
  })
  expect(seedIdBIP32).toBe(seedIdBIP32Again)
})
