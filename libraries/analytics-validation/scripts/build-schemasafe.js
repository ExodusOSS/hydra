const { resolve } = require('path')
const fs = require('fs')

// TODO: some day on Node v20 replace with readdirSync(..., { recursive: true })
const getFiles = (dir) => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((fileOrDir) => {
    const res = resolve(dir, fileOrDir.name)
    if (fileOrDir.isDirectory()) {
      return getFiles(res)
    }

    return fileOrDir.name
  })
}

const schemas = getFiles('./src')
  .sort()
  .filter((name) => name.endsWith('.schemasafe.json'))
  .map((name) => name.replace(/\.schemasafe\.json$/u, ''))
  .filter((name) => !['main', 'common-properties', 'empty-event'].includes(name))
  .map((name) => ({ $ref: `${name}#` }))

const mainSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  description: 'This schema will be used by the analytics module before tracking events.',
  type: 'object',
  required: ['event'],
  properties: {
    event: {
      type: 'string',
      pattern: '^.*$', // Single line, FIXME: perhaps alphanumeric?
    },
  },
  anyOf: [
    {
      discriminator: { propertyName: 'event' },
      oneOf: schemas,
    },
    { $ref: 'empty-event#' },
  ],
  unevaluatedProperties: false,
}

fs.writeFileSync('./src/main.schemasafe.json', JSON.stringify(mainSchema, null, 2))
