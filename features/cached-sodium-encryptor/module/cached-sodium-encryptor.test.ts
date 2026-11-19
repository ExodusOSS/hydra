import type { Mock, TestContext } from 'node:test'
import { beforeEach, describe, mock, test } from 'node:test'

import { randomBytes } from '@exodus/crypto/randomBytes'
import KeyIdentifier from '@exodus/key-identifier'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import type { ZodError } from '@exodus/zod'

import { ALLOWED_KEY_IDS } from './cached-sodium-encryptor.js'
import { CachedSodiumEncryptor } from './index.js'
import type { Keychain } from './types.js'

describe('CachedSodiumEncryptor', () => {
  const seedId = 'abc'
  const keyId = EXODUS_KEY_IDS.FUSION

  let cachedSodiumEncryptor: CachedSodiumEncryptor
  let keychain: {
    exportKey: Mock<any>
  }

  beforeEach(() => {
    keychain = {
      exportKey: mock.fn(async () => ({
        privateKey: randomBytes(32),
      })),
    }

    cachedSodiumEncryptor = new CachedSodiumEncryptor({
      keychain: keychain as Keychain,
    })
  })

  test('derives keys only once', async (t: TestContext) => {
    const result = await cachedSodiumEncryptor.encryptSecretBox({
      seedId,
      keyId,
      data: Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8'),
    })

    t.assert.ok(result instanceof Buffer, 'result is not a buffer')
    t.assert.equal(keychain.exportKey.mock.callCount(), 1)

    await cachedSodiumEncryptor.encryptSecretBox({
      seedId,
      keyId,
      data: Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8'),
    })

    t.assert.equal(keychain.exportKey.mock.callCount(), 1)
  })

  test('throws on non-allowed key ids', async (t: TestContext) => {
    const keyIds = Object.values(EXODUS_KEY_IDS)

    for (const keyId of keyIds) {
      if (ALLOWED_KEY_IDS.some((allowedKeyId) => KeyIdentifier.compare(allowedKeyId, keyId))) {
        continue
      }

      await t.assert.rejects(
        cachedSodiumEncryptor.encryptSecretBox({
          seedId,
          keyId,
          data: Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8'),
        }),
        new Error('Key source not allowed for caching.')
      )
    }
  })

  test('supports encrypting with secret key', async (t: TestContext) => {
    const data = Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8')

    const encrypted = await cachedSodiumEncryptor.encryptSecretBox({
      seedId,
      keyId,
      data,
    })

    const encryptedWithDerivedSecret = await cachedSodiumEncryptor.encryptSecretBox({
      seedId,
      keyId,
      data,
      deriveSecret: true,
    })

    t.assert.ok(Buffer.compare(encrypted, encryptedWithDerivedSecret) !== 0)
    t.assert.ok(Buffer.compare(encryptedWithDerivedSecret, data) !== 0)

    await t.assert.rejects(
      cachedSodiumEncryptor.decryptSecretBox({
        seedId,
        keyId,
        data: encryptedWithDerivedSecret,
      }),
      new Error('invalid tag')
    )

    const decrypted = await cachedSodiumEncryptor.decryptSecretBox({
      seedId,
      keyId,
      data: encryptedWithDerivedSecret,
      deriveSecret: true,
    })

    t.assert.ok(Buffer.compare(decrypted, data) === 0)
  })

  describe('param validation', () => {
    const allowedParams = {
      seedId,
      keyId,
      data: Buffer.from('Batman is Bruce Wayne - or is he Harvey Dent?', 'utf8'),
    }

    const expectInvalidParam = (err: ZodError) => {
      const [issue] = err.issues
      if (issue === undefined || err.issues.length > 1) {
        return false
      }

      return issue.code === 'unrecognized_keys' && issue.keys[0] === 'xrp'
    }

    test('encryptSecretBox does not allow passing additional params', async (t: TestContext) => {
      t.assert.throws(
        () =>
          cachedSodiumEncryptor.encryptSecretBox({
            ...allowedParams,
            deriveSecret: true,
            // @ts-expect-error testing additional invalid params
            xrp: 'is a disgrace',
          }),
        expectInvalidParam
      )
    })

    test('decryptSecretBox does not allow passing additional params', async (t: TestContext) => {
      t.assert.throws(
        () =>
          cachedSodiumEncryptor.decryptSecretBox({
            ...allowedParams,
            deriveSecret: false,
            // @ts-expect-error testing additional invalid params
            xrp: 'is a disgrace',
          }),
        expectInvalidParam
      )
    })

    test('encryptBox does not allow passing additional params', async (t: TestContext) => {
      t.assert.throws(
        () =>
          cachedSodiumEncryptor.encryptBox({
            ...allowedParams,
            toPublicKey: randomBytes(32),
            // @ts-expect-error testing additional invalid params
            xrp: 'is a disgrace',
          }),
        expectInvalidParam
      )
    })

    test('decryptBox does not allow passing additional params', async (t: TestContext) => {
      t.assert.throws(
        () =>
          cachedSodiumEncryptor.decryptBox({
            ...allowedParams,
            fromPublicKey: randomBytes(32),
            // @ts-expect-error testing additional invalid params
            xrp: 'is a disgrace',
          }),
        expectInvalidParam
      )
    })
  })
})
