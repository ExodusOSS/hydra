import Table from 'cli-table'

// Based on https://github.com/lingui/js-lingui/blob/8590c1a4c79a22483a28d8a041809340697e6a3f/packages/cli/src/api/stats.ts
export const printStats = (stats) => {
  const table = new Table({
    head: ['Language', 'Total count', 'Missing'],
    colAligns: ['left', 'middle', 'middle'],
    style: {
      head: ['green'],
      border: [],
      compact: true,
    },
  })

  stats.forEach(({ locale, stat }) => {
    const language = `${locale.name} ${locale.isSource ? '(source)' : ''}`
    const size = stat.size
    const missing = locale.isSource ? '-' : stat.missing

    table.push([language, size, missing])
  })

  console.log(table.toString())
}
