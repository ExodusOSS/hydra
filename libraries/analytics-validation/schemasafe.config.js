const fs = require('fs')
const path = require('path')

const schemas = {}

const getSchemas = ({ schemaDir, schemaNames }) => {
  for (const schemaName of schemaNames) {
    if (schemaName === 'main.schemasafe.json') continue
    const schemaPath = path.join(schemaDir, schemaName)

    if (fs.statSync(schemaPath).isDirectory()) {
      if (schemaName === '__tests__') continue
      getSchemas({ schemaDir: schemaPath, schemaNames: fs.readdirSync(schemaPath) })
    } else if (schemaName.endsWith('.json')) {
      // primitive-type.schemafe.json -> primitive-type
      const name = schemaName.slice(0, schemaName.indexOf('.'))
      const schemaString = fs.readFileSync(schemaPath, 'utf8')
      schemas[name] = JSON.parse(schemaString)
    }
  }
}

const schemaDir = path.join(__dirname, './src')
const schemaNames = fs.readdirSync(schemaDir)

getSchemas({ schemaDir, schemaNames })

// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semVerRegEx =
  // eslint-disable-next-line sonarjs/regex-complexity
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/u
const localeRegEx = /^[A-Za-z]{2,8}([_-][\dA-Za-z]{1,8}){0,2}$/u
// NOTE: this is exported so consumers can use the same settings at runtime
// as were used to compile schemas at build time
module.exports = {
  extraFormats: true,
  formats: {
    'any-string': (str) => typeof str === 'string',
    'semver-string': semVerRegEx,
    locale: localeRegEx,
  },
  schemas,
  mode: 'default',
}
