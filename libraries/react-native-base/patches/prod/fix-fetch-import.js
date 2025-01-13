#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { reactNativeVersion, directories } = require('../../utils/context')

const after = `require('../fetch')`

const fixFetch = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken fetch fix')

  const filePath = path.join(
    directories.nodeModules.prod.absolute,
    'whatwg-fetch/dist/fetch.umd.js'
  )

  const file = fs.readFileSync(filePath, 'utf8')
  if (file !== after) {
    console.log('# Fixing whatwg-fetch import')
    fs.writeFileSync(filePath, after)
  }
}

fixFetch()
