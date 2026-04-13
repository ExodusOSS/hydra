import extractFiles from './extractor.js'
import mergeLocale from './merge.js'
import fileManager from '../file-manager.js'
import { printStats } from './print.js'

const filterEntriesForLocale = (entries, locale, scopedLocales) => {
  const scopedDirs = Object.keys(scopedLocales)
  if (scopedDirs.length === 0) return entries

  return entries.filter((entry) => {
    const matchedDir = scopedDirs.find((dir) => entry.reference.startsWith(dir))
    if (!matchedDir) return true
    return scopedLocales[matchedDir].includes(locale.name)
  })
}

const extract = (fileNames, locales, options, scopedLocales = {}) => {
  const entries = extractFiles(fileNames, options)

  const stats = []

  locales.forEach((locale) => {
    const filteredEntries = filterEntriesForLocale(entries, locale, scopedLocales)
    const stat = mergeLocale(filteredEntries, locale, fileManager)

    stats.push({ locale, stat })
  })

  printStats(stats)
}

export default extract
