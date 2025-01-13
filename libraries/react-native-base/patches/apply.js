#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const os = require('node:os')
const { getArgumentValue } = require('../utils/process')
const { execFileSync } = require('child_process')

const VERBOSE_FLAGS = new Set(['-v', '--verbose'])

const runPatch = (patch) => {
  if (path.extname(patch) === '.diff') {
    return execFileSync('patch', ['-N', '-p1', '-i', patch])
  }

  return execFileSync(patch)
}

const readDirConfig = { withFileTypes: true }

module.exports = async function applyPatches({
  folder,
  customPatchesFolder,
  externalPatches = [],
  limitToOs = {},
}) {
  const verbose = process.argv.some((arg) => VERBOSE_FLAGS.has(arg))
  const omit = new Set((getArgumentValue('--omit') || '').split(','))

  const patches = [
    ...fs.readdirSync(path.join(__dirname, folder), readDirConfig),
    ...(fs.existsSync(customPatchesFolder)
      ? fs.readdirSync(customPatchesFolder, readDirConfig)
      : []),
  ]
    .filter(
      (entry) =>
        ((entry.isFile() && !limitToOs[entry.name]) || limitToOs[entry.name].includes(os.type())) &&
        !omit.has(entry.name)
    )
    .map(({ path: patchPath, name }) => {
      if (name.endsWith('.diff')) {
        const diffRegex = /^[\w-]+\.diff$/u
        if (!diffRegex.test(name)) {
          throw new Error(`\n
        Error in @exodus/react-native-base. Patch: ${name}
        =========================================================================
        | Yo, I'm catching a whiff of some sketchy cyber shenanigans around here!|
        | Please change file name to something like: xxx-yyy.diff                |
        | If the file name is legit and I made a mistake please report.          |
        =========================================================================
        `)
        }
      }

      return path.join(patchPath, name)
    })

  const allPatches = [...patches, ...externalPatches]

  const results = []
  for (const patch of allPatches) {
    // we just want to await it so it happens in series
    try {
      results.push(runPatch(patch))
    } catch (error) {
      results.push({ error })
    }
  }

  const failed = results.reduce((agg, result, i) => {
    const { error } = result || {}
    const patchName = path.basename(allPatches[i])

    if (
      !error ||
      // Already applied patch will output an error but we can consider it successful
      error.stdout?.includes('previously applied')
    ) {
      console.log(`Successfully applied patch ${patchName}`)
      return agg
    }

    console.log(`Failed to apply patch ${patchName}`)
    if (verbose) {
      console.error(error)
    }

    return agg + 1
  }, 0)

  if (failed > 0) {
    console.error(`Failed to apply ${failed} patches`)
    process.exit(1)
  }
}
