const estree = require('./estree')

const parseForESLint = (code, { filePath }) => {
  const ast = estree(code, filePath)
  ast.sourceType = 'script'

  return {
    ast,
  }
}

const parse = (code, options) => parseForESLint(code, options).ast

module.exports = {
  parse,
  parseForESLint,
}
