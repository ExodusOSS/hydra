const { directories } = require('../utils/context')

const path = require('path')
const mappings = [
  [
    'pngjs',
    new Map([['zlib', path.join(directories.nodeModules.prod.absolute, 'browserify-zlib')]]),
  ],
]

module.exports = mappings
