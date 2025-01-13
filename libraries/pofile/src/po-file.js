const POEntry = require('./po-entry')

class POFile {
  #entries = []
  #entryMap = new Map()
  #computedIdsEnabled = true

  constructor({ entries = [], computedIdsEnabled = true } = {}) {
    this.#entries = entries
    this.#computedIdsEnabled = computedIdsEnabled

    entries.forEach((entry) => this.#entryMap.set(this.#transformPlaceholders(entry.id), entry))
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

  #transformPlaceholders = (x) => (this.#computedIdsEnabled ? POEntry.unifyPlaceholders(x) : x)

  exists = (id) => {
    return this.#entryMap.has(this.#transformPlaceholders(id))
  }

  getEntry = (id) => {
    return this.#entryMap.get(this.#transformPlaceholders(id))
  }

  #appendEntry = ({ id, ...args }) => {
    const entry = new POEntry({ id, ...args })

    this.#entries.push(entry)
    this.#entryMap.set(this.#transformPlaceholders(id), entry)

    return entry
  }

  #mergeEntry = ({ id, value, comments, references }) => {
    const entry = this.#entryMap.get(this.#transformPlaceholders(id))

    if (value && this.#transformPlaceholders(entry.value) !== this.#transformPlaceholders(value))
      throw new Error(`pofile: can't merge entries with different values`)

    comments?.forEach((comment) => entry.addComment(comment))
    references?.forEach((reference) => entry.addReference(reference))

    return entry
  }

  addEntry = ({ id, ...args }) => {
    return this.exists(id)
      ? // ...
        this.#mergeEntry({ id, ...args })
      : this.#appendEntry({ id, ...args })
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
