const delimiter = '::'

const createEntryId = ({ id, context } = Object.create(null)) => {
  if (typeof id !== 'string') throw new Error(`pofile: entry id must be a string. Got ${typeof id}`)
  if (id.length === 0) throw new Error(`pofile: entry id must be a non-empty string`)

  const contextSuffix =
    typeof context === 'string' && context.trim().length > 0 ? `${delimiter}${context.trim()}` : ''

  return `${id}${contextSuffix}`
}

const parseEntryId = (entryId) => {
  const [id, ...segments] = entryId.split(delimiter)
  return { id, context: segments.join(delimiter) || undefined }
}

module.exports = {
  createEntryId,
  parseEntryId,
}
