import { Cookie } from './types'

function toFirstUpper(value: string): string {
  const first = value[0]
  if (!first) return ''

  return first.toUpperCase() + value.slice(1)
}

const PROPERTY_NAMES = new Map([['maxAge', 'Max-Age']])

type CookieValue = Cookie[keyof Cookie]

function serializeProp([key, value]: [string, CookieValue]): string | undefined {
  if (value === undefined) return undefined

  if (typeof value === 'boolean') {
    return value ? toFirstUpper(key) : undefined
  }

  if (value instanceof Date) {
    value = value.toUTCString()
  }

  const name = PROPERTY_NAMES.get(key)
  return `${name ?? toFirstUpper(key)}=${value}`
}

export default function serialize(cookie: Cookie): string {
  const { name, value, ...rest } = cookie

  const elements = [
    `${name}=${value || ''}`,
    ...Object.entries(rest).map(serializeProp).filter(Boolean),
  ]

  return elements.join('; ')
}
