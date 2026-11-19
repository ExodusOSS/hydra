import type { Json, Schema } from '@exodus/schemasafe'
import { validator } from '@exodus/schemasafe'

import schemasafeOptions from '../../schemasafe.config.js'

const defaultOptions = { mode: 'strong', includeErrors: true, extraFormats: true } // from @exodus/schemasafe-babel-plugin

// from @exodus/schemasafe-babel-plugin, inlined
export default function buildSchema(schema: Schema) {
  const validate = validator(schema, { ...defaultOptions, ...schemasafeOptions })
  return (value: unknown) => {
    class SchemaSafeValidationError extends Error {
      keyword: string
      instanceLocation: string
      constructor(
        message: string,
        { keyword, instanceLocation }: { keyword: string; instanceLocation: string }
      ) {
        super(message)
        this.name = 'SchemaSafeValidationError'
        this.keyword = keyword
        this.instanceLocation = instanceLocation
      }
    }

    const isValid = validate(value as Json)
    if (!isValid) {
      const { keywordLocation, instanceLocation } = validate.errors![0]!
      const keyword = keywordLocation.slice(keywordLocation.lastIndexOf('/') + 1)
      const message = `JSON validation failed for ${keyword} at ${instanceLocation}`

      throw new SchemaSafeValidationError(message, { keyword, instanceLocation })
    }

    return value
  }
}
