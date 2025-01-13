const schemasafe = require('@exodus/schemasafe')
const path = require('path')
const fs = require('fs')
const minimatch = require('minimatch')

const defaultOptions = require('./default-options')

const createValidatorDeclaration = ({
  babel,
  variableName,
  resolvedSchemaPath,
  schemasafeOptions,
}) => {
  const schema = JSON.parse(fs.readFileSync(resolvedSchemaPath, 'utf8'))
  const validatorModule = schemasafe
    .validator(schema, { ...defaultOptions, ...schemasafeOptions })
    .toModule()

  const temporaryNode = `
    (value) => {
      const validate = ${validatorModule}

      class SchemaSafeValidationError extends Error {
        constructor(message, { keyword, instanceLocation }) {
          super(message)
          this.name = 'SchemaSafeValidationError'
          this.keyword = keyword
          this.instanceLocation = instanceLocation
        }
      }

      const isValid = validate(value)
      if (!isValid) {
        const { keywordLocation, instanceLocation } = validate.errors[0]
        const keyword = keywordLocation.slice(
          keywordLocation.lastIndexOf('/') + 1,
        )
        const message = \`JSON validation failed for \${keyword} at \${instanceLocation}\`

        throw new SchemaSafeValidationError(message, { keyword, instanceLocation })
      }

      return value
    }
  `
  const importNode = babel.template.expression.ast(temporaryNode)

  return babel.types.variableDeclaration('const', [
    babel.types.variableDeclarator(babel.types.identifier(variableName), importNode),
  ])
}

// Compiles the imported 'moduleName' with @exodus/schemasafe
// if the module matches all global patterns.
const attemptToCompile = (
  { globs, schemasafeOptions },
  { babel, moduleName, babelPath, fileName }
) => {
  const resolvedSchemaPath = path.resolve(path.parse(fileName).dir, moduleName)

  if (globs.some((glob) => minimatch(resolvedSchemaPath, glob) !== true)) return

  const nodes = babelPath.node.specifiers.map((specifier) =>
    createValidatorDeclaration({
      babel,
      variableName: specifier.local.name,
      resolvedSchemaPath,
      schemasafeOptions,
    })
  )

  babelPath.replaceWithMultiple(nodes)
}

// Detects all schema imports and replaces them with a generated validator code.
module.exports = (babel, { options = [] } = {}) => {
  return {
    visitor: {
      ImportDeclaration(babelPath) {
        const moduleName = babelPath.node.source.value

        options.forEach((option) =>
          attemptToCompile(option, { babel, moduleName, babelPath, fileName: this.filename })
        )
      },
    },
  }
}

// Needs just for testing.
module.exports.attemptToCompile = attemptToCompile
module.exports.createValidatorDeclaration = createValidatorDeclaration
