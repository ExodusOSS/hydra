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

  const entries = sections.map((section) => {
    const tokens = tokenizer(section)
    const entry = parser(tokens)

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
