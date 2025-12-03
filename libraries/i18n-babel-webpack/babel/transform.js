const { parse } = require('@exodus/pofile')
const { compileCatalog } = require('./compile.js')
const { getMessages } = require('./po.js')

function transform(content) {
  // Parse po file content entries
  const poContent = parse(content)

  // Computes po entries ICU message representations
  const messages = getMessages(poContent.toJSON())

  // Compile messages into code
  return compileCatalog({ messages })
}

module.exports = transform
