import { create } from '@exodus/pofile'

const mergedEntry = ({ sourceEntry, entryWithChanges }) => {
  if (!entryWithChanges) {
    return { ...sourceEntry }
  }

  const { value: changedValue, comments: changedComments } = entryWithChanges
  return {
    value:
      changedValue && !sourceEntry.value && changedValue !== sourceEntry.value
        ? changedValue
        : sourceEntry.value,
    comments: changedComments.length > 0 ? changedComments : sourceEntry.comments,
    references: sourceEntry.references,
    id: sourceEntry.id,
  }
}

const mergePo = ({ sourceEntries, entriesWithChanges }) => {
  const newPoFile = create()
  sourceEntries.forEach((sourceEntry) => {
    const matchingEntry = entriesWithChanges.find((entry) => entry.id === sourceEntry.id)
    const newEntry = mergedEntry({ sourceEntry, entryWithChanges: matchingEntry })
    newPoFile.addEntry(newEntry)
  })

  return newPoFile
}

export default mergePo
