import { getContextSchema, type SafeContextType } from './schemas.js'

export const SafeContext = {
  parse(unsafeContext: unknown): SafeContextType {
    try {
      return getContextSchema().parse(unsafeContext)
    } catch {
      return undefined
    }
  },
  getSchema: getContextSchema,
}

export type { SafeContextType } from './schemas.js'
