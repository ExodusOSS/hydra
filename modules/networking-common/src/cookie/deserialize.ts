import { Cookie } from './types'

function toFirstLower(value: string): string {
  const first = value[0]
  if (!first) return ''

  return first.toLowerCase() + value.slice(1)
}

type CookieKey = keyof Cookie
type CookieValue = Cookie[CookieKey]

function assertDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) throw new Error(message)
}

type Factory<Key extends keyof Cookie> = {
  key: Key
  getInstance: (value: string | undefined) => Cookie[Key]
}

const FACTORIES: Map<string, Factory<CookieKey>> = new Map(
  Object.entries({
    'Max-Age': {
      key: 'maxAge',
      getInstance: Number,
    },
    HttpOnly: {
      key: 'httpOnly',
      getInstance: () => true,
    },
    Expires: {
      key: 'expires',
      getInstance: (value) => {
        assertDefined(
          value,
          'Malformed cookie string: Received undefined value for property Expires'
        )
        return new Date(value)
      },
    },
    Secure: {
      key: 'secure',
      getInstance: () => true,
    },
  })
)

function deserializeNameAndValue(nameValue: string): { name?: string; value?: string } {
  if (!nameValue.includes('=')) {
    return { name: '', value: nameValue }
  }

  const [name, value] = nameValue.split(/=(.*)/) // split at first '='
  return { name, value }
}

export default function deserialize(cookieString: string): Cookie {
  const [nameValue, ...rest] = cookieString.split('; ')

  assertDefined(nameValue, `Malformed cookie string: ${cookieString}`)

  const { name, value } = deserializeNameAndValue(nameValue)

  const cookie: Record<string, CookieValue> = { name, value }

  rest.forEach((property) => {
    const [key, value] = property.split('=')

    assertDefined(key, `Malformed cookie string: Encountered property without key.`)

    const factory = FACTORIES.get(key)
    if (factory) {
      cookie[factory.key] = factory.getInstance(value)
      return
    }

    cookie[toFirstLower(key)] = value
  })

  return cookie as Cookie
}
