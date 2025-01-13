const { directories } = require('../utils/context')
const cryptoMapping = new Map([['crypto', require.resolve('./modules/crypto.js')]])

const path = require('path')
const mappings = [
  [
    'pngjs',
    new Map([['zlib', path.join(directories.nodeModules.prod.absolute, 'browserify-zlib')]]),
  ],
  ['@exodus/walletconnect-randombytes', cryptoMapping],
  ['@exodus/walletconnect-crypto', cryptoMapping],
  ['@exodus/hashgraph-sdk', cryptoMapping],
  ['@walletconnect/randombytes', cryptoMapping],
  ['@walletconnect/crypto', cryptoMapping],
  ['@exodus/hashgraph-cryptography', cryptoMapping],
  ['@exodus/exodus-pgp', cryptoMapping],
  ['@exodus/ethers', cryptoMapping],
  ['hdkey', cryptoMapping],
  ['@exodus/hdkey', cryptoMapping],
]

module.exports = mappings
