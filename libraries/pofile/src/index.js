const tokenizer = require('./tokenizer')
const parser = require('./parser')
const POFile = require('./po-file')
const POEntry = require('./po-entry')
const { createEntryId, parseEntryId } = require('./utils')

const parse = (input) => {
  const data = input.replace(/\r\n/gu, '\n')
  const sections = data.split(/\n\n/u)

  // Remove the header if it exists
  if (sections[0].includes('msgid ""')) {
    sections.shift()
  }

  // Values stay in raw PO-escaped form: runtime translation ids are computed
  // from these bytes, so `\n` must remain two characters.
  const entries = sections.map((section) => {
    const entry = parser(tokenizer(section))

    return new POEntry({
      id: entry.msgid,
      value: entry.msgstr,
      comments: entry.comments,
      context: entry.msgctxt,
      references: entry.references,
      flags: entry.flags,
    })
  })

  return new POFile({ entries })
}

const create = (...args) => new POFile(...args)

module.exports = {
  parse,
  create,
  createEntryId,
  parseEntryId,
  computeId: POEntry.computeId,
}
