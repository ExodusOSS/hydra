const { escapeRawValue } = require('./escape')
const { createEntryId } = require('./utils')

class POEntry {
  #msgid = []
  #msgstr = []
  #msgctxt
  #comments = []
  #references = []
  #flags = []

  constructor({ id, value, comments = [], context = '', references = [], flags = [] }) {
    // Values are stored in raw PO-escaped form. Only `\"` is normalized to `"`
    // so ids match the unescaped quotes of the JS source they came from.
    this.#msgid = id?.replaceAll('\\"', '"')
    this.#msgstr = value?.replaceAll('\\"', '"')
    this.#msgctxt = context?.replaceAll('\\"', '"')
    this.#comments = comments
    this.#references = references
    this.#flags = flags
  }

  get id() {
    return this.#msgid
  }

  get uniqueId() {
    return POEntry.computeId(createEntryId({ id: this.#msgid, context: this.#msgctxt }))
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

  get context() {
    return this.#msgctxt
  }

  static unifyPlaceholders = (source) => {
    return source.replace(/{(?:\w+\.?)+}/g, '{}')
  }

  static computeId = POEntry.unifyPlaceholders

  setId = (id) => {
    if (typeof id !== 'string') {
      throw new TypeError(`pofile: entry id must be a string. Got ${typeof id}`)
    }

    this.#msgid = id

    return this
  }

  setValue = (value) => {
    if (typeof value !== 'string') {
      throw new TypeError(`pofile: entry value must be a string. Got ${typeof value}`)
    }

    this.#msgstr = value

    return this
  }

  addComment = (comment) => {
    if (typeof comment !== 'string') {
      throw new TypeError(`pofile: comment must be string. Got ${typeof comment}`)
    }

    this.#comments.push(comment)

    return this
  }

  addContext = (context) => {
    if (typeof context !== 'string') {
      throw new TypeError(`pofile: context must be string. Got ${typeof context}`)
    }

    this.#msgctxt = context

    return this
  }

  addReference = (reference) => {
    if (typeof reference !== 'string') {
      throw new TypeError(`pofile: reference must be string. Got ${typeof reference}`)
    }

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
      uniqueId: this.uniqueId,
      value: this.value,
      comments: this.comments,
      flags: this.flags,
      references: this.references,
      ...(this.context ? { context: this.context } : {}),
    }
  }

  toString = () => {
    const comments = this.#comments.map((comment) => `# ${comment}`)
    const references = this.#references.map((reference) => `#: ${reference}`)
    const flags = this.#flags.map((flag) => `#, ${flag}`)
    const id = escapeRawValue(this.#msgid ?? '')
    const message = escapeRawValue(this.#msgstr ?? '')
    const context = escapeRawValue(this.#msgctxt ?? '')

    // gettext requires msgctxt before msgid.
    return [
      ...comments,
      ...flags,
      ...references,
      ...(context ? [`msgctxt "${context}"`] : []),
      `msgid "${id}"`,
      `msgstr "${message}"`,
    ].join('\n')
  }
}

module.exports = POEntry
