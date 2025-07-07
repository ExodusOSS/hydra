export default function safeParse(schema, obj) {
  const parsed = schema.safeParse(obj)
  if (parsed.success) {
    return parsed.data
  }

  switch (schema._def.typeName) {
    case 'ZodNullable':
      return safeParse(schema._def.innerType, obj)
    case 'ZodArray':
      return Array.isArray(obj) ? obj.map((item) => safeParse(schema.element, item)) : []
    case 'ZodObject':
      if (typeof obj !== 'object') return null

      return (
        obj &&
        Object.fromEntries(
          Object.entries(obj)
            .filter(([key]) => key in schema.shape)
            .map(([key, value]) => {
              const fieldSchema = schema.shape[key]
              return [key, safeParse(fieldSchema, value)]
            })
        )
      )
    case 'ZodRecord':
      if (typeof obj !== 'object') return null

      return (
        obj &&
        Object.fromEntries(
          Object.entries(obj)
            .filter(([key]) => {
              const { success } = schema._def.keyType.safeParse(key)
              return success
            })
            .map(([key, value]) => {
              const fieldSchema = schema._def.valueType
              return [key, safeParse(fieldSchema, value)]
            })
        )
      )
    default:
      return null
  }
}
