#!/usr/bin/env node
const path = require('path')
const applyPatches = require('./apply')
const { directories } = require('../utils/context')

applyPatches({
  folder: 'prod',
  customPatchesFolder: path.join(directories.root.absolute, 'patches'),
  externalPatches: [path.join(directories.nodeModules.prod.absolute, 'jetifier/bin/jetify')],
})
