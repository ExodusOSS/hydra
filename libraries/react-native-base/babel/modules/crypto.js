import aes from 'browserify-aes'
// TODO: refactor to use `@exodus/crypto`
// eslint-disable-next-line @exodus/restricted-imports/no-crypto
import createHash from 'create-hash'
// TODO: refactor to use `@exodus/crypto`
// eslint-disable-next-line @exodus/restricted-imports/no-crypto
import createHmac from 'create-hmac'
import pbkdf2 from 'pbkdf2'
import { randomBytes } from '@exodus/crypto/randomBytes'

// https://github.com/crypto-browserify/crypto-browserify/blob/8c5454c49e821e9be05792cec7b59a7f82e0a0f6/index.js#L88
const constants = {
  DH_CHECK_P_NOT_SAFE_PRIME: 2,
  DH_CHECK_P_NOT_PRIME: 1,
  DH_UNABLE_TO_CHECK_GENERATOR: 4,
  DH_NOT_SUITABLE_GENERATOR: 8,
  NPN_ENABLED: 1,
  ALPN_ENABLED: 1,
  RSA_PKCS1_PADDING: 1,
  RSA_SSLV23_PADDING: 2,
  RSA_NO_PADDING: 3,
  RSA_PKCS1_OAEP_PADDING: 4,
  RSA_X931_PADDING: 5,
  RSA_PKCS1_PSS_PADDING: 6,
  POINT_CONVERSION_COMPRESSED: 2,
  POINT_CONVERSION_UNCOMPRESSED: 4,
  POINT_CONVERSION_HYBRID: 6,
}

const crypto = {
  randomBytes,
  createHmac,
  createHash,
  constants,
  ...aes,
  ...pbkdf2,
}

module.exports = crypto
module.exports.default = crypto
