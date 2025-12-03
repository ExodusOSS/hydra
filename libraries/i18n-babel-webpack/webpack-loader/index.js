const { readFileSync } = require('fs')
const path = require('path')

const JavascriptParser = require('webpack/lib/Parser.js')

const JavascriptGenerator = require('webpack/lib/JavascriptGenerator.js') // present in webpack@4.15.1

const transform = require('../babel/transform.js')

function loader() {
  const extname = path.extname(this.resourcePath)
  if (extname !== '.po') {
    throw new Error(`Unsupported file type. Expected a '.po' file, got '${extname}' instead.`)
  }

  this._module.type = 'javascript/auto'
  this._module.parser = new JavascriptParser()
  this._module.generator = new JavascriptGenerator()

  // Read and parse imported .po file
  const content = readFileSync(this.resourcePath).toString()

  return '/*eslint-disable*/' + transform(content)
}

module.exports = loader
