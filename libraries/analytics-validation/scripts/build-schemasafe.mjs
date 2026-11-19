import { resolve, relative, dirname, basename } from 'node:path'
import fs from 'node:fs'

// TODO: some day on Node v20 replace with readdirSync(..., { recursive: true })
const getFiles = (dir) => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((fileOrDir) => {
    const res = resolve(dir, fileOrDir.name)
    if (fileOrDir.isDirectory()) {
      if (fileOrDir.name === '__tests__') return []
      return getFiles(res)
    }

    return res
  })
}

const schemaPaths = getFiles('./src')
  .filter((p) => p.endsWith('.schemasafe.json'))
  .sort()

const refs = schemaPaths
  .map((p) => basename(p, '.schemasafe.json'))
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
      oneOf: refs,
    },
    { $ref: 'empty-event#' },
  ],
  unevaluatedProperties: false,
}

fs.writeFileSync('./src/main.schemasafe.json', JSON.stringify(mainSchema, null, 2))

// Mirror sub-schemas into lib/ so consumers can resolve $refs without shipping src/
const srcRoot = resolve('./src')
for (const schemaPath of schemaPaths) {
  if (basename(schemaPath) === 'main.schemasafe.json') continue
  const dest = resolve('./lib', relative(srcRoot, schemaPath))
  fs.mkdirSync(dirname(dest), { recursive: true })
  fs.copyFileSync(schemaPath, dest)
}
