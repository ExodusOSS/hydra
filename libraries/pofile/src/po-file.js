const POEntry = require('./po-entry')
const { createEntryId } = require('./utils')

class POFile {
  #entries = []
  #entryMap = new Map()
  #computedIdsEnabled = true

  constructor({ entries = [], computedIdsEnabled = true } = Object.create(null)) {
    this.#entries = entries
    this.#computedIdsEnabled = computedIdsEnabled

    entries.forEach((entry) =>
      this.#entryMap.set(this.#transformPlaceholders(entry.id, entry.context), entry)
    )
  }

  get entries() {
    return this.#entries.map((entry) => entry.toJSON())
  }

  get size() {
    return this.#entries.length
  }

  get missing() {
    return this.#entries.filter((e) => !e.value).length
  }

  #transformPlaceholders = (id, context) => {
    const entryId = createEntryId({ id, context })

    return this.#computedIdsEnabled ? POEntry.unifyPlaceholders(entryId) : entryId
  }

  exists = (id, context) => {
    return this.#entryMap.has(this.#transformPlaceholders(id, context))
  }

  getEntry = (id, context) => {
    return this.#entryMap.get(this.#transformPlaceholders(id, context))
  }

  #appendEntry = ({ id, context, ...args }) => {
    const entry = new POEntry({ id, context, ...args })

    this.#entries.push(entry)
    this.#entryMap.set(this.#transformPlaceholders(id, context), entry)

    return entry
  }

  #mergeEntry = ({ id, value, comments, context, references }) => {
    const entry = this.#entryMap.get(this.#transformPlaceholders(id, context))

    if (value && this.#transformPlaceholders(entry.value) !== this.#transformPlaceholders(value))
      throw new Error(`pofile: can't merge entries with different values`)

    comments?.forEach((comment) => entry.addComment(comment))
    references?.forEach((reference) => entry.addReference(reference))

    return entry
  }

  addEntry = (entry) => {
    return this.exists(entry.id, entry.context)
      ? // ...
        this.#mergeEntry(entry)
      : this.#appendEntry(entry)
  }

  toJSON = () => {
    return { entries: this.entries }
  }

  toString = () => {
    const entries = this.#entries.map((entry) => entry.toString())
    return entries.join(`\n\n`)
  }
}

module.exports = POFile
