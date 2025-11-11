import { partition } from '@exodus/basic-utils'
import pofile from '@exodus/pofile'

const { create, computeId, createEntryId } = pofile

/**
 * Deduplicate entries by uniqueId, dropping empty duplicates
 * (keeping only the first if they’re all empty), in original order.
 */
const filterDuplicateEntries = (entries) => {
  const groups = entries.reduce((m, e) => {
    const arr = m.get(e.uniqueId) || []
    arr.push(e)
    m.set(e.uniqueId, arr)
    return m
  }, new Map())

  const seen = new Set()

  return entries.reduce((result, e) => {
    if (seen.has(e.uniqueId)) {
      return result
    }

    seen.add(e.uniqueId)
    const group = groups.get(e.uniqueId)
    const nonEmpty = group.filter((g) => g.value?.trim())

    const toKeep = nonEmpty.length > 0 ? nonEmpty : [group[0]]
    return [...result, ...toKeep]
  }, [])
}

const mergeLocale = (entries, locale, fileManager) => {
  const localePath = locale.file
  const currentEntries = fileManager.read(localePath).entries
  const filteredEntries = filterDuplicateEntries(currentEntries)

  const newEntriesMap = Object.fromEntries(
    entries.map(({ id, context }) => {
      const entryId = createEntryId({ id, context })
      return [computeId(entryId), true]
    })
  )

  const newPoFile = create()

  filteredEntries.forEach(({ id, uniqueId, value, comments, context }) => {
    if (!newEntriesMap[uniqueId]) return

    try {
      newPoFile.addEntry({ id, value, comments, context })
    } catch (err) {
      console.error('Problematic message id:', `"${id}"`)
      throw err
    }
  })

  const [existing, added] = partition(entries, ({ id, context }) => newPoFile.exists(id, context))

  // Update existing references and values
  existing.forEach(({ id, context, reference }) => {
    newPoFile.getEntry(id, context).addReference(reference)
  })

  // Add new entries at the bottom
  added.forEach(({ id, context, reference }) => {
    newPoFile.addEntry({
      id,
      context,
      value: locale.isSource ? id : '',
      references: [reference],
    })
  })

  fileManager.write(localePath, newPoFile)
  return { size: newPoFile.size, missing: newPoFile.missing }
}

export default mergeLocale
