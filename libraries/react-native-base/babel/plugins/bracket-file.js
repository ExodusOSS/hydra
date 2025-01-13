const { resolve: resolvePath } = require('path')
const { default: template } = require('@babel/template')

// source: https://github.com/babel/babel/blob/e334a8888468e38cb04d3b465c158f06c012938f/packages/babel-helper-module-transforms/src/index.js#L90-L95
const hoistAboveImports = (statement) => {
  statement._blockHoist = 4 // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
  return statement
}

const createHeader = (filename) =>
  hoistAboveImports(template.ast(`console.log('babel-plugin-bracket-file:start:${filename}');\n`))

const createFooter = (filename) =>
  template.ast(`console.log('babel-plugin-bracket-file:end:${filename}');\n`)

const basePath = process.cwd()

const bracketFile = (babel) => {
  return {
    visitor: {
      Program: {
        exit(path, state) {
          const { filename } = state.file.opts
          const absPath = resolvePath(basePath, filename).replace(
            new RegExp(`${basePath}/src/node_modules`),
            `${basePath}/node_modules`
          )

          const header = createHeader(absPath)
          const footer = createFooter(absPath)

          path.node.body.unshift(header)
          path.node.body.push(footer)
        },
      },
    },
  }
}

module.exports = bracketFile
