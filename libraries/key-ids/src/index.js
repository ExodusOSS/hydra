import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'

export const createKeyIdentifierForExodus = ({ exoType }) => {
  assert(typeof exoType === 'string', 'exotype must be of type string')
  const keyId = EXODUS_KEY_IDS[exoType]
  if (!keyId) {
    throw new TypeError('Invalid exodus key requested')
  }

  return keyId
}

const EXO = Number.parseInt(Buffer.from('exo').toString('hex'), '16')

export const EXODUS_KEY_IDS = Object.freeze({
  __proto__: null,
  WALLET_INFO: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/0`,
    keyType: 'nacl',
  }),
  BACKUP_FILE: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/1`,
    keyType: 'nacl',
  }),
  FIAT_RAMP: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/6'/0'`,
    keyType: 'secp256k1',
  }),
  FUSION: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/0'`,
    keyType: 'nacl',
  }),
  '2FA_MODE': new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/1'`,
    keyType: 'nacl',
  }),
  TELEMETRY: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/3'`,
    keyType: 'nacl',
  }),
  SUPPORT_CHAT: new KeyIdentifier({
    __proto__: null,
    derivationPath: `m/${EXO}'/4'/0'`,
    derivationAlgorithm: 'BIP32',
    keyType: 'secp256k1',
  }),
  SEEDLESS: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/5'/0'`,
    keyType: 'nacl',
  }),
  EXTRA_SEEDS_ENCRYPTION: new KeyIdentifier({
    __proto__: null,
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/7'/0'`,
    keyType: 'nacl',
  }),
})
