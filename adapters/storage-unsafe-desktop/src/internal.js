const makeConcurrent = require('make-concurrent')
const delay = require('delay')
const { getLockFile, getTmpFile, getFlagFile } = require('./utils')

const checkContents = (writtenContents) => writtenContents.length > 0

// fs must provide fs-extra compatible { readFile, outputFile, ensureFile, move, remove }
function createStorageInternal({ fs, file, createNewFileIfError = false }) {
  const lockFile = getLockFile(file)
  const tmpFile = getTmpFile(file)
  const flagFile = getFlagFile(file)

  let data

  const initialized = (async function () {
    try {
      data = await fs.readFile(file)
      data = Object.assign(Object.create(null), JSON.parse(data))
    } catch (err) {
      if (!createNewFileIfError && err.code !== 'ENOENT') throw err

      data = Object.create(null)
    }
  })()

  let needsFlush = false
  const flush = makeConcurrent(
    async () => {
      // This may be an unneeded queued write; if so, abort
      if (!needsFlush) return

      // Delay to batch multiple operations
      await delay(100)

      try {
        const newData = JSON.stringify(data)

        needsFlush = false

        // Windows sometimes writes out empty files, so we write to a tmp file first, check it, then move it into place
        // if the check fails, we log and try writing again
        let writtenContents
        let tries = 0
        do {
          // only log on retry
          if (writtenContents) console.warn(`unsafe storage write invalid; retrying ${tries}`)
          await fs.outputFile(tmpFile, newData)
          writtenContents = await fs.readFile(tmpFile)
        } while (!checkContents(writtenContents) && ++tries < 5)

        // output flag file so we can debug corruption
        if (tries === 5) await fs.ensureFile(flagFile)

        await fs.move(tmpFile, file, { overwrite: true })
      } finally {
        // Only remove lockFile if there's been no calls to writeToDisk since we wrote
        if (!needsFlush) await fs.remove(lockFile)
      }
    },
    { concurrency: 1 }
  )

  const writeToDisk = async () => {
    needsFlush = true
    await fs.outputFile(lockFile, '')
    await flush()
  }

  return {
    get: async (key) => {
      await initialized
      return data[key]
    },
    batchGet: async (keys) => {
      await initialized
      return keys.map((key) => data[key])
    },
    set: async (key, value) => {
      await initialized
      if (value === undefined) throw new Error(`cannot set ${key} to undefined`)
      data[key] = value
      await writeToDisk()
    },
    batchSet: async (obj) => {
      await initialized
      Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) throw new Error(`cannot set ${key} to undefined`)
        data[key] = value
      })
      await writeToDisk()
    },
    delete: async (key) => {
      await initialized
      delete data[key]
      await writeToDisk()
    },
    batchDelete: async (keys) => {
      await initialized
      keys.forEach((key) => delete data[key])
      await writeToDisk()
    },
    clear: async (prefix) => {
      await initialized
      Object.keys(data).forEach((key) => {
        if (key.startsWith(prefix)) delete data[key]
      })
      await writeToDisk()
    },
  }
}

module.exports = { createStorageInternal }
