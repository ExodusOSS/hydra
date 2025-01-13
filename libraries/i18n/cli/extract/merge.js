import { partition } from '@exodus/basic-utils'
import pofile from '@exodus/pofile'

const { create, computeId } = pofile

const mergeLocale = (entries, locale, fileManager) => {
  const localePath = locale.file

  const currentPoFile = fileManager.read(localePath)
  const currentEntries = currentPoFile.entries

  const newPoFile = create()
  const newEntriesMap = Object.fromEntries(entries.map((entry) => [computeId(entry.id), true]))

  // Add non-deleted entries in the same order
  currentEntries.forEach(({ id, value, comments }) => {
    if (!newEntriesMap[computeId(id)]) return
    newPoFile.addEntry({ id, value, comments })
  })

  const [existing, added] = partition(entries, (entry) => newPoFile.exists(entry.id))

  // Update existing references and values
  existing.forEach(({ id, reference }) => {
    newPoFile.getEntry(id).addReference(reference)
  })

  // Add new entries at the bottom
  added.forEach(({ id, reference }) => {
    newPoFile.addEntry({ id, value: locale.isSource ? id : '', references: [reference] })
  })

  fileManager.write(localePath, newPoFile)

  return { size: newPoFile.size, missing: newPoFile.missing }
}

export default mergeLocale
