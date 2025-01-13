import createMergedPOFile from './merge-po.js'
import fileManager from '../file-manager.js'

const merge = ({ pathToSourceFile, pathToFileWithChanges }) => {
  if (!pathToFileWithChanges) {
    throw new Error('Make sure to provide the path to the PO file to copy.')
  }

  const sourcePOFile = fileManager.read(pathToSourceFile)
  const sourceEntries = sourcePOFile.entries

  const poWithChanges = fileManager.read(pathToFileWithChanges)
  const entriesWithChanges = poWithChanges.entries

  const newPOFile = createMergedPOFile({ sourceEntries, entriesWithChanges })
  fileManager.write(pathToSourceFile, newPOFile)
}

export default merge
