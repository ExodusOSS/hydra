const { parse } = require('@exodus/pofile')
const fs = require('fs')
const { join, dirname } = require('path')
const { getMessages } = require('./po.js')
const { compileMessage } = require('./compile.js')

/**
 * Inlines PO files. To be used in projects without webpack.
 */

function inlinePoPlugin(babel) {
  const t = babel.types

  const getStringValue = (node) => {
    if (t.isStringLiteral(node)) {
      return node.value
    }

    if (t.isTemplateLiteral(node)) {
      return node.quasis.map((text) => text.value.raw).join('')
    }
  }

  return {
    visitor: {
      CallExpression(babelPath, state) {
        const { node } = babelPath

        if (!t.isIdentifier(node.callee, { name: 'require' })) return

        const firstArgument = node.arguments[0]

        if (!t.isStringLiteral(firstArgument) && !t.isTemplateLiteral(firstArgument)) return

        const relativePath = getStringValue(firstArgument)

        if (!relativePath.endsWith('.po')) return

        const content = fs
          .readFileSync(join(dirname(state.filename), relativePath))
          .toString('utf8')
        const poContent = parse(content)
        // Computes po entries ICU message representations
        const messages = getMessages(poContent.toJSON())
        const compiledMessages = messages.map((element) => compileMessage(element))

        babelPath.replaceWith(t.objectExpression(compiledMessages))
      },
    },
  }
}

module.exports = inlinePoPlugin
