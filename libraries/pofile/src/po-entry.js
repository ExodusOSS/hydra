class POEntry {
  #msgid = []
  #msgstr = []
  #comments = []
  #references = []
  #flags = []

  constructor({ id, value, comments = [], references = [], flags = [] }) {
    this.#msgid = id.replace(/\\"/gu, '"')
    this.#msgstr = value.replace(/\\"/gu, '"')
    this.#comments = comments
    this.#references = references
    this.#flags = flags
  }

  get id() {
    return this.#msgid
  }

  get value() {
    return this.#msgstr
  }

  get comments() {
    return this.#comments
  }

  get references() {
    return this.#references.sort()
  }

  get flags() {
    return this.#flags
  }

  static unifyPlaceholders = (source) => {
    return source.replace(/{(?:\w+\.?)+}/g, '{}') // eslint-disable-line regexp/require-unicode-regexp
  }

  static computeId = POEntry.unifyPlaceholders

  setId = (id) => {
    if (typeof id !== 'string')
      throw new Error(`pofile: entry id must be a string. Got ${typeof id}`)

    this.#msgid = id

    return this
  }

  setValue = (value) => {
    if (typeof value !== 'string')
      throw new Error(`pofile: entry value must be a string. Got ${typeof value}`)

    this.#msgstr = value

    return this
  }

  addComment = (comment) => {
    if (typeof comment !== 'string')
      throw new Error(`pofile: comment must be string. Got ${typeof comment}`)

    this.#comments.push(comment)

    return this
  }

  addReference = (reference) => {
    if (typeof reference !== 'string')
      throw new Error(`pofile: reference must be string. Got ${typeof reference}`)

    this.#references.push(reference)

    return this
  }

  addFlag = (flag) => {
    if (typeof flag !== 'string') throw new Error(`pofile: flag must be string. Got ${typeof flag}`)

    this.#flags.push(flag)

    return this
  }

  toJSON = () => {
    return {
      id: this.id,
      value: this.value,
      comments: this.comments,
      flags: this.flags,
      references: this.references,
    }
  }

  toString = () => {
    const comments = this.#comments.map((comment) => `# ${comment}`)
    const references = this.#references.map((reference) => `#: ${reference}`)
    const flags = this.#flags.map((flag) => `#, ${flag}`)
    const id = this.#msgid.replace(/"/gu, '\\"')
    const message = this.#msgstr.replace(/"/gu, '\\"')

    return [...comments, ...flags, ...references, `msgid "${id}"`, `msgstr "${message}"`].join('\n')
  }
}

module.exports = POEntry
