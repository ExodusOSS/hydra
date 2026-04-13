import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'

export async function createSigner({ keychain, seedId }) {
  const getPublicKey = async ({ keyId }) => {
    assert(KeyIdentifier.validate(keyId), 'getPublicKey: invalid `keyId`')
    return keychain.getPublicKey({ seedId, keyId })
  }

  const sign = ({ data, keyId, signatureType, enc, tweak, extraEntropy }) => {
    assert(KeyIdentifier.validate(keyId), 'sign: invalid `keyId`')

    return keychain.signBuffer({
      seedId,
      keyId,
      data,
      signatureType,
      enc,
      tweak,
      extraEntropy,
    })
  }

  return { sign, getPublicKey }
}

export async function createExternalSigner({ keychain, privateKey, keyId }) {
  const seedId = await keychain.addExternalPrivateKey({ privateKey, keyId })
  return createSigner({ keychain, seedId })
}
