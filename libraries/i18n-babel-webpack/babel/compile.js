const {
  objectExpression,
  objectProperty,
  stringLiteral,
  numericLiteral,
  arrayExpression,
  memberExpression,
  identifier,
  expressionStatement,
  assignmentExpression,
} = require('@babel/types')
const generateCJS = require('@babel/generator')

const generate = generateCJS.default || generateCJS

const compileObject = (object) => {
  return objectExpression(
    Object.entries(object)
      .filter((entry) => entry[1] !== undefined)
      .map(([key, value]) =>
        objectProperty(
          // ...
          stringLiteral(key),
          typeof value === 'string' ? stringLiteral(value) : numericLiteral(value)
        )
      )
  )
}

// Compile ICU tokens js array into [tokens] ast
function compileIcuTokens(tokens) {
  return arrayExpression(
    tokens.map((token) => {
      if (token.type === 'text' || token.type === 'arg') {
        return compileObject(token)
      }

      throw new Error(`Invalid token: ${token}`)
    })
  )
}

// Compile { id, tokens } js map into { [id]: tokens } ast
function compileMessage({ id, tokens }) {
  const compiledTokens = compileIcuTokens(tokens)

  return objectProperty(stringLiteral(id), compiledTokens)
}

// Builds module.exports statement with translated messages
function buildExportStatement(expression) {
  const exportExpression = memberExpression(identifier('module'), identifier('exports'))

  return expressionStatement(assignmentExpression('=', exportExpression, expression))
}

// Compiles [{ id: string, tokens: ICUTokens[]}] array into "{ [id]: tokens }" string
function compileCatalog({ messages }) {
  const compiledMessages = messages.map((element) => compileMessage(element))

  const ast = buildExportStatement(objectExpression(compiledMessages))

  return generate(ast, { minified: true, jsescOption: { minimal: true } }).code
}

module.exports = {
  compileMessage,
  compileCatalog,
}
