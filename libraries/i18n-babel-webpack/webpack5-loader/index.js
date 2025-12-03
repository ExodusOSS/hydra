const { readFileSync } = require('fs')
const path = require('path')

const transform = require('../babel/transform.js')

function loader() {
  const extname = path.extname(this.resourcePath)
  if (extname !== '.po') {
    throw new Error(`Unsupported file type. Expected a '.po' file, got '${extname}' instead.`)
  }

  // Read and parse imported .po file
  const content = readFileSync(this.resourcePath).toString()

  return '/*eslint-disable*/\n' + transform(content)
}

export default loader
