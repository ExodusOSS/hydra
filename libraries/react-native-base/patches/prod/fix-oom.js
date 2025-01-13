#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Applies fixes from
// https://github.com/facebook/react-native/commit/88e18b6c8d562a4571cc48c202dda944cacfd742 -> already implemented in ./fix-gc.js
// https://github.com/facebook/react-native/commit/c5c79e5d718ad0777e014dd8c1e8d398d8172f3d
// fix that removes fetch body blobs after they are read

// Based on discussion:
// https://github.com/facebook/react-native/issues/23801
// https://github.com/facebook/react-native/pull/24767
// https://github.com/facebook/react-native/pull/24405

const { before } = require('../changes/oom-before')
const { after } = require('../changes/oom-after')
const { reactNativeVersion } = require('../../utils/context')

const replacements = Object.keys(before).map((key) => {
  const beforeString = before[key].val
  const afterString = after[key].val
  return {
    ...before[key],
    ...after[key],
    before: beforeString,
    after: afterString,
    val: undefined,
  }
})

const oomFix = () => {
  if (reactNativeVersion !== '0.71.11') throw new Error('broken fetch memory leak fix')

  let replaced = false
  replacements.forEach(({ before, after, filePath, newFile }) => {
    filePath = path.resolve(__dirname, filePath)
    let file
    try {
      file = fs.readFileSync(filePath, 'utf8')
      if (newFile) return // the file was already created
    } catch (error) {
      if (newFile) {
        replaced = true
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        return fs.writeFileSync(filePath, after, { flag: 'w' })
      }

      throw error
    }

    if (file.includes(before)) {
      replaced = true
      fs.writeFileSync(filePath, file.replace(before, after))
    }
  })

  if (replaced) console.log('# Fixing fetch memory leak')
}

oomFix()
