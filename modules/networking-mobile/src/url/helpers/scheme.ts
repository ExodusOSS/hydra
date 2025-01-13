import { SCHEME_CHARACTER_ALLOWLIST, SPECIAL_SCHEMES } from './constants'
import { codepoint } from './string'
import { URLRecord } from './types'

export const SCHEME_CODEPOINT_ALLOWLIST = SCHEME_CHARACTER_ALLOWLIST.map(codepoint)

export function isSpecialScheme(scheme: string | undefined): boolean {
  return SPECIAL_SCHEMES[scheme as never] !== undefined // eslint-disable-line @typescript-eslint/no-unnecessary-condition
}

export function isSpecial(url: URLRecord): boolean {
  return isSpecialScheme(url.scheme)
}
