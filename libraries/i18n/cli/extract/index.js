import extractFiles from './extractor.js'
import mergeLocale from './merge.js'
import fileManager from '../file-manager.js'
import { printStats } from './print.js'

const extract = (fileNames, locales, options) => {
  const entries = extractFiles(fileNames, options)

  const stats = []

  locales.forEach((locale) => {
    const stat = mergeLocale(entries, locale, fileManager)

    stats.push({ locale, stat })
  })

  printStats(stats)
}

export default extract
