import { validator } from '@exodus/schemasafe' // eslint-disable-line import/no-extraneous-dependencies

import schemasafeOptions from '../../schemasafe.config.js'

const defaultOptions = { mode: 'strong', includeErrors: true, extraFormats: true } // from @exodus/schemasafe-babel-plugin

// from @exodus/schemasafe-babel-plugin, inlined
export default function buildSchema(schema) {
  const validate = validator(schema, { ...defaultOptions, ...schemasafeOptions })
  return (value) => {
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
      const keyword = keywordLocation.slice(keywordLocation.lastIndexOf('/') + 1)
      const message = `JSON validation failed for ${keyword} at ${instanceLocation}`

      throw new SchemaSafeValidationError(message, { keyword, instanceLocation })
    }

    return value
  }
}
