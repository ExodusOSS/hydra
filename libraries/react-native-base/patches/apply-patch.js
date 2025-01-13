#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const applyPatch = (file, before, after) => {
  const filePath = path.resolve(__dirname, file)
  const source = fs.readFileSync(filePath, 'utf8')

  const patchable = source.includes(before)
  const alreadyPatched = source.includes(after)

  if (!patchable && !alreadyPatched) {
    throw new Error('broken patch request')
  }

  if (patchable) {
    fs.writeFileSync(filePath, source.replace(before, after))
  }
}

module.exports = applyPatch
