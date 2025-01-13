const fs = require('fs-extra')
const { createStorageInternal } = require('./internal')
const addNamespacing = require('@exodus/storage-enhancers/namespacing')
const { getLockFile } = require('./utils')

function createStorage(opts) {
  const storage = createStorageInternal(opts)
  return addNamespacing(storage)
}

function isStorageWriting(file) {
  return fs.pathExistsSync(getLockFile(file))
}

module.exports = { createStorage, isStorageWriting }
