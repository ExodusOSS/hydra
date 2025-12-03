const { computeId } = require('@exodus/pofile')
const { parse } = require('../icu/index.js')

function getMessages(poContent) {
  return poContent.entries.map(({ uniqueId, value }) => {
    return {
      id: computeId(uniqueId),
      tokens: parse(value || ''),
    }
  })
}

module.exports = {
  getMessages,
}
