#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { directories, jestVersion } = require('../../utils/context')

function replaceResolver() {
  const fileToReplacePath = path.join(
    directories.nodeModules.root.absolute,
    'jest-resolve/build/defaultResolver.js'
  )

  if (!fs.existsSync(fileToReplacePath)) {
    return
  }

  if (jestVersion >= 'v27.5.0') {
    console.log(`Resolver is already fixed in jest ${jestVersion}. Nothing to do`)
    return
  }

  const current = fs.readFileSync(fileToReplacePath)
  const before = fs.readFileSync(
    path.resolve(__dirname, '../changes/jest-resolve/defaultResolver/before.js')
  )

  const after = fs.readFileSync(
    path.resolve(__dirname, '../changes/jest-resolve/defaultResolver/after.js')
  )

  if (current.equals(before)) {
    console.log('replacing jest resolver with patched version')
    fs.writeFileSync(fileToReplacePath, after)
  }
}

replaceResolver()
