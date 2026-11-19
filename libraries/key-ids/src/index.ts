import { toBigInt } from '@exodus/bytes/bigint.js'
import { utf8fromString } from '@exodus/bytes/utf8.js'
import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'

const EXO = toBigInt(utf8fromString('exo'))

const _EXODUS_KEY_IDS = Object.freeze({
  __proto__: null,
  WALLET_INFO: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/0`,
    keyType: 'nacl',
  }),
  BACKUP_FILE: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/1'/1`,
    keyType: 'nacl',
  }),
  FIAT_RAMP: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/6'/0'`,
    keyType: 'secp256k1',
  }),
  FUSION: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/0'`,
    keyType: 'nacl',
  }),
  '2FA_MODE': new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/1'`,
    keyType: 'nacl',
  }),
  TELEMETRY: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/2'/3'`,
    keyType: 'nacl',
  }),
  SUPPORT_CHAT: new KeyIdentifier({
    derivationPath: `m/${EXO}'/4'/0'`,
    derivationAlgorithm: 'BIP32',
    keyType: 'secp256k1',
  }),
  SEEDLESS: new KeyIdentifier({
    derivationAlgorithm: 'SLIP10',
    derivationPath: `m/${EXO}'/5'/0'`,
    keyType: 'nacl',
  }),
  PAY: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/8'/0'`,
    keyType: 'nacl',
  }),
  PAY_GIFT_CARD: new KeyIdentifier({
    derivationAlgorithm: 'BIP32',
    derivationPath: `m/${EXO}'/8'/1'`,
    keyType: 'nacl',
  }),
})

export const EXODUS_KEY_IDS: Omit<typeof _EXODUS_KEY_IDS, '__proto__'> = _EXODUS_KEY_IDS

export type ExodusKeyId = keyof typeof EXODUS_KEY_IDS

export const createKeyIdentifierForExodus = ({
  exoType,
}: {
  exoType: ExodusKeyId
}): KeyIdentifier => {
  assert(typeof exoType === 'string', 'exotype must be of type string')
  const keyId = EXODUS_KEY_IDS[exoType]
  if (!keyId) {
    throw new TypeError('Invalid exodus key requested')
  }

  return keyId
}
