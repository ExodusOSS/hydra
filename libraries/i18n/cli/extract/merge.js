import { partition } from '@exodus/basic-utils'
import pofile from '@exodus/pofile'

const { create, computeId, createEntryId } = pofile

const mergeLocale = (entries, locale, fileManager) => {
  const localePath = locale.file

  const currentPoFile = fileManager.read(localePath)
  const currentEntries = currentPoFile.entries

  const newPoFile = create()
  const newEntriesMap = Object.fromEntries(
    entries.map(({ id, context }) => {
      const entryId = createEntryId({ id, context })

      return [computeId(entryId), true]
    })
  )

  // Add non-deleted entries in the same order
  currentEntries.forEach(({ id, uniqueId, value, comments, context }) => {
    if (!newEntriesMap[computeId(uniqueId)]) return

    newPoFile.addEntry({ id, value, comments, context })
  })

  const [existing, added] = partition(entries, ({ id, context }) => newPoFile.exists(id, context))

  // Update existing references and values
  existing.forEach(({ id, context, reference }) => {
    newPoFile.getEntry(id, context).addReference(reference)
  })

  // Add new entries at the bottom
  added.forEach(({ id, context, reference }) => {
    newPoFile.addEntry({ id, context, value: locale.isSource ? id : '', references: [reference] })
  })

  fileManager.write(localePath, newPoFile)

  return { size: newPoFile.size, missing: newPoFile.missing }
}

export default mergeLocale
