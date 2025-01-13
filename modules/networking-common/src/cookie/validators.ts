import { CONTROL_CHARACTERS_AND_SEPARATORS, FORBIDDEN_IN_VALUE } from './constants'
import { BaseCookie } from './types'

function validateName(name?: string) {
  if (!name) return
  // cookie-name = token = any char - separators - ctrl chars
  for (const char of CONTROL_CHARACTERS_AND_SEPARATORS) {
    if (name.includes(char)) {
      throw new Error(`Cookie name contains invalid character: ${char}`)
    }
  }
}

function validateValue(value?: string) {
  if (!value) return

  if (value.startsWith('"') && value.endsWith('"')) {
    // unwrap quoted value
    value = value.slice(1, -1)
  }

  for (const char of FORBIDDEN_IN_VALUE) {
    if (value.includes(char)) {
      throw new Error(`Cookie name contains invalid character: ${char}`)
    }
  }
}

function assertMatchingDomain(domain: string | undefined, originDomain: string) {
  if (domain === undefined) return

  // Domain matching: https://datatracker.ietf.org/doc/html/rfc6265#section-5.1.3
  if (domain === originDomain) return

  if (isSubdomain(domain, originDomain)) {
    throw new Error(
      `Cannot set a cookie for a subdomain. Tried to set ${domain} with origin ${originDomain}`
    )
  }

  if (isSubdomain(originDomain, domain)) {
    return
  }

  throw new Error(
    `Cannot set a cookie for a third party origin. Tried to set ${domain} with origin ${originDomain}`
  )
}

function isSubdomain(value: string, domain: string): boolean {
  /*
   *  - The domain string is a suffix of the string.
   *  - The last character of the string that is not included in the
   *     domain string is a %x2E (".") character.
   *  - The string is a host name (i.e., not an IP address).
   */

  return value.endsWith(domain) && value.replace(domain, '').endsWith('.') && isHostname(value)
}

const v4 =
  /^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$/

function isHostname(value: string): boolean {
  // TODO: also make sure this ain't a v6 ip address
  return !v4.test(value)
}

function validate(cookie: BaseCookie) {
  validateName(cookie.name)
  validateValue(cookie.value)
}

export { validate, assertMatchingDomain }
