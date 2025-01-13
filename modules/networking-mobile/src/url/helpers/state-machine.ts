import { URLRecord } from './types'
import {
  isC0ControlPercentEncode,
  isFragmentPercentEncode,
  isPathPercentEncode,
  isQueryPercentEncode,
  isSpecialQueryPercentEncode,
  isUserinfoPercentEncode,
  utf8PercentEncodeCodepoint,
  utf8PercentEncodeString,
} from './encoding'
import {
  isNormalizedWindowsDriveLetterString,
  isWindowsDriveLetterString,
  startsWithWindowsDriveLetter,
} from './windows'
import { defaultPort, parseHost } from './host'
import {
  codepoint,
  codepoints,
  countSymbols,
  isASCIIAlpha,
  isASCIIAlphanumeric,
  isASCIIDigit,
  isASCIIHex,
  isDoubleDot,
  isSingleDot,
  trimControlChars,
  trimTabAndNewline,
} from './string'
import { FAILURE, STOP_PROCESSING } from './constants'
import { isSpecial, isSpecialScheme, SCHEME_CODEPOINT_ALLOWLIST } from './scheme'
import { hasOpaquePath, shortenPath } from './path'
import { includesCredentials } from './credentials'

export const Parsers = {
  SchemeStart: Symbol('scheme start'),
  Scheme: Symbol('scheme'),
  NoScheme: Symbol('no scheme'),
  File: Symbol('file'),
  SpecialRelativeOrAuthority: Symbol('special relative or authority'),
  SpecialAuthoritySlashes: Symbol('special authority slashes'),
  SpecialAuthorityIgnoreSlashes: Symbol('special authority ignore slashes'),
  SpecialPathOrAuthority: Symbol('special path or authority'),
  Fragment: Symbol('fragment'),
  Authority: Symbol('authority'),
  Relative: Symbol('relative'),
  RelativeSlash: Symbol('relative slash'),
  FileSlash: Symbol('file slash'),
  Query: Symbol('query'),
  FileHost: Symbol('file host'),
  Path: Symbol('path'),
  PathStart: Symbol('path start'),
  Host: Symbol('host'),
  Hostname: Symbol('hostname'),
  Port: Symbol('port'),
} as const

type ParserSymbol = typeof Parsers[keyof typeof Parsers]

type ParserFunction = (
  codePoint: number,
  character?: string
) => typeof FAILURE | typeof STOP_PROCESSING | void

class ParsingStateMachine {
  private cursor = 0
  private buffer = ''

  failure = false
  private parseError = false

  private encounteredArray = false
  private encounteredAt = false
  private encounteredPassword = false

  private readonly codepoints: number[]

  readonly url: URLRecord
  private readonly base?: URLRecord

  private encoding: string

  private readonly startWith?: ParserSymbol
  private next: ParserFunction

  constructor(options: {
    input: string
    base?: URLRecord | null
    url?: URLRecord | null
    encoding?: string
    startWith?: ParserSymbol
  }) {
    const { url, base, encoding = 'utf-8', startWith } = options
    let { input } = options

    this.startWith = startWith
    this.next = this.getParser(startWith ?? Parsers.SchemeStart)

    this.encoding = encoding

    if (base) {
      this.base = base
    }

    this.url = url ?? {
      path: [],
      username: '',
      password: '',
    }

    if (!url) {
      const trimmed = trimControlChars(input)
      if (trimmed !== input) {
        this.parseError = true
      }
      input = trimmed
    }

    const trimmed = trimTabAndNewline(input)
    if (trimmed !== input) {
      this.parseError = true
    }
    input = trimmed

    this.buffer = ''
    this.codepoints = [...input].map((c) => c.codePointAt(0)) as never

    while (this.cursor <= this.codepoints.length) {
      const codepoint = this.codepoints[this.cursor]
      const character = isNaN(codepoint) ? undefined : String.fromCodePoint(codepoint)

      const proceed = this.next(codepoint, character)

      if (proceed === STOP_PROCESSING) {
        return
      }

      if (proceed === FAILURE) {
        this.failure = true
        return
      }

      this.cursor += 1
    }
  }

  parseSchemeStart(code: number, character?: string) {
    if (isASCIIAlpha(code)) {
      this.buffer += character?.toLowerCase()
      this.next = this.parseScheme
      return
    }

    if (!this.startWith) {
      this.next = this.parseNoScheme
      this.cursor -= 1
      return
    }

    this.parseError = true
    return FAILURE
  }

  parseScheme(code: number, character?: string) {
    if (isASCIIAlphanumeric(code) || SCHEME_CODEPOINT_ALLOWLIST.includes(code)) {
      this.buffer += character?.toLowerCase()
      return
    }

    if (code === codepoint(':')) {
      if (this.startWith) {
        if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
          return STOP_PROCESSING
        }

        if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
          return STOP_PROCESSING
        }

        if (
          (includesCredentials(this.url) || this.url.port !== undefined) &&
          this.buffer === 'file'
        ) {
          return STOP_PROCESSING
        }

        if (this.url.scheme === 'file' && this.url.host === '') {
          return STOP_PROCESSING
        }
      }
      this.url.scheme = this.buffer

      if (this.startWith) {
        if (this.url.port === defaultPort(this.url.scheme)) {
          this.url.port = undefined
        }
        return STOP_PROCESSING
      }

      this.buffer = ''

      if (this.url.scheme === 'file') {
        if (!this.followedBy('//')) {
          this.parseError = true
        }
        this.next = this.parseFile
        return
      }

      if (isSpecial(this.url) && this.base?.scheme === this.url.scheme) {
        this.next = this.parseSpecialRelativeOrAuthority
        return
      }

      if (isSpecial(this.url)) {
        this.next = this.parseSpecialAuthoritySlashes
        return
      }

      if (this.followedBy('/')) {
        this.next = this.parsePathOrAuthority
        this.cursor += 1
        return
      }

      this.url.path = ''
      this.next = this.parseOpaquePath

      return
    }

    if (!this.startWith) {
      this.cursor -= this.buffer.length + 1
      this.buffer = ''
      this.next = this.parseNoScheme
      return
    }

    this.parseError = true
    return FAILURE
  }

  parseOpaquePath(code: number) {
    if (code === codepoint('?')) {
      this.url.query = ''
      this.next = this.parseQuery
      return
    }

    if (code === codepoint('#')) {
      this.url.fragment = ''
      this.next = this.parseFragment
      return
    }

    if (!isNaN(code) && code !== codepoint('%')) {
      this.parseError = true
    }

    if (code === codepoint('%') && (!isASCIIHex(this.peek(1)) || !isASCIIHex(this.peek(2)))) {
      this.parseError = true
    }

    if (!isNaN(code)) {
      this.url.path += utf8PercentEncodeCodepoint(code, isC0ControlPercentEncode) ?? ''
    }
  }

  parseNoScheme(code: number) {
    if (!this.base || (hasOpaquePath(this.base) && code !== codepoint('#'))) {
      return FAILURE
    }

    if (hasOpaquePath(this.base) && code === codepoint('#')) {
      this.url.scheme = this.base.scheme
      this.url.path = this.base.path
      this.url.query = this.base.query
      this.url.fragment = ''
      this.next = this.parseFragment
      return
    }

    if (this.base.scheme === 'file') {
      this.next = this.parseFile
      this.cursor -= 1
      return
    }

    this.next = this.parseRelative
    this.cursor -= 1
  }

  parseFile(code: number) {
    this.url.scheme = 'file'
    this.url.host = ''

    if (code === codepoint('/') || code === codepoint('\\')) {
      if (code === codepoint('\\')) {
        this.parseError = true
      }
      this.next = this.parseFileSlash
      return
    }

    if (this.base?.scheme === 'file') {
      this.url.host = this.base.host
      this.url.path = [...this.base.path]
      this.url.query = this.base.query

      if (code === codepoint('?')) {
        this.url.query = ''
        this.next = this.parseQuery
        return
      }

      if (code === codepoint('#')) {
        this.url.fragment = ''
        this.next = this.parseFragment
        return
      }

      if (!isNaN(code)) {
        this.url.query = undefined
        if (startsWithWindowsDriveLetter(this.codepoints, this.cursor)) {
          this.parseError = true
          this.url.path = []
        } else {
          shortenPath(this.url)
        }

        this.next = this.parsePath
        this.cursor -= 1
      }

      return
    }

    this.next = this.parsePath
    this.cursor -= 1
  }

  parseSpecialRelativeOrAuthority(code: number) {
    if (code === codepoint('/') && this.followedBy('/')) {
      this.next = this.parseSpecialAuthorityIgnoreSlashes
      this.cursor += 1
      return
    }

    this.parseError = true
    this.next = this.parseRelative
    this.cursor -= 1
  }

  parseSpecialAuthoritySlashes(code: number) {
    this.next = this.parseSpecialAuthorityIgnoreSlashes
    if (code === codepoint('/') && this.followedBy('/')) {
      this.cursor += 1
      return
    }

    this.parseError = true
    this.cursor -= 1
  }

  parseSpecialAuthorityIgnoreSlashes(code: number) {
    if (!codepoints('/', '\\').includes(code)) {
      this.next = this.parseAuthority
      this.cursor -= 1
      return
    }

    this.parseError = true
  }

  parsePathOrAuthority(code: number) {
    if (code === codepoint('/')) {
      this.next = this.parseAuthority
      return
    }

    this.next = this.parsePath
    this.cursor -= 1
  }

  parseFragment(code: number) {
    if (isNaN(code)) return

    if (code === codepoint('%') && (!isASCIIHex(this.peek(1)) || !isASCIIHex(this.peek(2)))) {
      this.parseError = true
    }

    this.url.fragment += utf8PercentEncodeCodepoint(code, isFragmentPercentEncode) ?? ''
  }

  parseAuthority(code: number, character?: string) {
    if (code === codepoint('@')) {
      this.parseError = true
      if (this.encounteredAt) {
        this.buffer = `%40${this.buffer}`
      }

      this.encounteredAt = true

      const length = countSymbols(this.buffer)
      for (let i = 0; i < length; ++i) {
        const bufferCode = this.buffer.codePointAt(i)

        if (bufferCode === codepoint(':') && !this.encounteredPassword) {
          this.encounteredPassword = true
          continue
        }

        const encoded = utf8PercentEncodeCodepoint(bufferCode, isUserinfoPercentEncode) ?? ''

        if (this.encounteredPassword) {
          this.url.password += encoded
          continue
        }

        this.url.username += encoded
      }

      this.buffer = ''
      return
    }

    if (
      isNaN(code) ||
      codepoints('/', '?', '#').includes(code) ||
      (isSpecial(this.url) && code === codepoint('\\'))
    ) {
      if (this.encounteredAt && this.buffer === '') {
        this.parseError = true
        return FAILURE
      }

      this.cursor -= countSymbols(this.buffer) + 1
      this.buffer = ''
      this.next = this.parseHost
      return
    }

    this.buffer += character
  }

  parseRelative(code: number) {
    this.url.scheme = this.base?.scheme

    if (code === codepoint('/')) {
      this.next = this.parseRelativeSlash
      return
    }

    if (isSpecial(this.url) && code === codepoint('\\')) {
      this.parseError = true
      this.next = this.parseRelativeSlash
      return
    }

    if (!this.base) {
      return FAILURE
    }

    this.url.username = this.base.username
    this.url.password = this.base.password
    this.url.host = this.base.host
    this.url.port = this.base.port
    this.url.path = [...this.base.path]
    this.url.query = this.base.query

    if (code === codepoint('?')) {
      this.url.query = ''
      this.next = this.parseQuery
      return
    }

    if (code === codepoint('#')) {
      this.url.fragment = ''
      this.next = this.parseFragment
      return
    }

    if (!isNaN(code)) {
      this.url.query = undefined
      this.url.path.pop()
      this.next = this.parsePath
      this.cursor -= 1
    }
  }

  parseRelativeSlash(code: number) {
    if (isSpecial(this.url) && codepoints('/', '\\').includes(code)) {
      if (code === codepoint('\\')) {
        this.parseError = true
      }
      this.next = this.parseSpecialAuthorityIgnoreSlashes
      return
    }

    if (code === codepoint('/')) {
      this.next = this.parseAuthority
      return
    }

    if (!this.base) {
      return FAILURE
    }

    this.url.username = this.base.username
    this.url.password = this.base.password
    this.url.host = this.base.host
    this.url.port = this.base.port

    this.next = this.parsePath
    this.cursor -= 1
  }

  parseFileSlash(code: number) {
    if (code === codepoint('/') || code === codepoint('\\')) {
      if (code === codepoint('\\')) {
        this.parseError = true
      }
      this.next = this.parseFileHost
      return
    }

    if (this.base?.scheme === 'file') {
      if (
        !startsWithWindowsDriveLetter(this.codepoints, this.cursor) &&
        isNormalizedWindowsDriveLetterString(this.base.path[0])
      ) {
        ;(this.url.path as string[]).push(this.base.path[0])
      }

      this.url.host = this.base.host
    }
    this.next = this.parsePath
    this.cursor -= 1
  }

  parseQuery(code: number, character?: string) {
    if (!isSpecial(this.url) || this.url.scheme === 'ws' || this.url.scheme === 'wss') {
      this.encoding = 'utf-8'
    }

    if ((!this.startWith && code === codepoint('#')) || isNaN(code)) {
      const predicate = isSpecial(this.url) ? isSpecialQueryPercentEncode : isQueryPercentEncode
      this.url.query += utf8PercentEncodeString(this.buffer, predicate)

      this.buffer = ''

      if (code === codepoint('#')) {
        this.url.fragment = ''
        this.next = this.parseFragment
      }
      return
    }

    if (!isNaN(code)) {
      if (code === codepoint('%') && (!isASCIIHex(this.peek(1)) || !isASCIIHex(this.peek(2)))) {
        this.parseError = true
      }

      this.buffer += character
    }
  }

  parseFileHost(code: number, character?: string) {
    if (isNaN(code) || codepoints('/', '\\', '?', '#').includes(code)) {
      this.cursor -= 1

      if (!this.startWith && isWindowsDriveLetterString(this.buffer)) {
        this.parseError = true
        this.next = this.parsePath
        return
      }

      if (this.buffer === '') {
        this.url.host = ''

        if (this.startWith) {
          return STOP_PROCESSING
        }

        this.next = this.parsePathStart
        return
      }

      let host = parseHost(this.buffer, !isSpecial(this.url))
      if (host === FAILURE) {
        return FAILURE
      }

      if (host === 'localhost') {
        host = ''
      }
      this.url.host = host as string

      if (this.startWith) {
        return STOP_PROCESSING
      }

      this.buffer = ''
      this.next = this.parsePathStart
      return
    }

    this.buffer += character
  }

  parsePath(code: number) {
    if (
      isNaN(code) ||
      code === codepoint('/') ||
      (isSpecial(this.url) && code === codepoint('\\')) ||
      (!this.startWith && (code === codepoint('?') || code === codepoint('#')))
    ) {
      if (isSpecial(this.url) && code === codepoint('\\')) {
        this.parseError = true
      }

      const path = this.url.path as string[]
      if (isDoubleDot(this.buffer)) {
        shortenPath(this.url)
        if (code !== codepoint('/') && !(isSpecial(this.url) && code === codepoint('\\'))) {
          path.push('')
        }
      } else if (
        isSingleDot(this.buffer) &&
        code !== codepoint('/') &&
        !(isSpecial(this.url) && code === codepoint('\\'))
      ) {
        path.push('')
      } else if (!isSingleDot(this.buffer)) {
        if (
          this.url.scheme === 'file' &&
          this.url.path.length === 0 &&
          isWindowsDriveLetterString(this.buffer)
        ) {
          this.buffer = `${this.buffer[0]}:`
        }

        path.push(this.buffer)
      }

      this.buffer = ''

      if (code === codepoint('?')) {
        this.url.query = ''
        this.next = this.parseQuery
        return
      }

      if (code === codepoint('#')) {
        this.url.fragment = ''
        this.next = this.parseFragment
      }
      return
    }

    if (code === codepoint('%') && (!isASCIIHex(this.peek(1)) || !isASCIIHex(this.peek(2)))) {
      this.parseError = true
    }

    this.buffer += utf8PercentEncodeCodepoint(code, isPathPercentEncode)
  }

  parsePathStart(code: number | undefined) {
    if (isSpecial(this.url)) {
      if (code === codepoint('\\')) {
        this.parseError = true
      }
      this.next = this.parsePath

      if (code !== codepoint('/') && code !== codepoint('\\')) {
        this.cursor -= 1
      }
      return
    }

    if (!this.startWith && code === codepoint('?')) {
      this.url.query = ''
      this.next = this.parseQuery
      return
    }

    if (!this.startWith && code === codepoint('#')) {
      this.url.fragment = ''
      this.next = this.parseFragment
      return
    }

    if (code !== undefined) {
      this.next = this.parsePath
      if (code !== codepoint('/')) {
        this.cursor -= 1
      }
      return
    }

    if (this.startWith && this.url.host === undefined) {
      ;(this.url.path as string[]).push('')
    }
  }

  parseHostname(code: number, character?: string) {
    return this.parseHost(code, character)
  }

  parseHost(code: number, character?: string) {
    if (this.startWith && this.url.scheme === 'file') {
      this.cursor -= 1
      this.next = this.parseFileHost
      return
    }

    if (code === codepoint(':') && !this.encounteredArray) {
      if (this.buffer === '') {
        this.parseError = true
        return FAILURE
      }

      if (this.startWith === Parsers.Hostname) {
        return STOP_PROCESSING
      }

      const host = parseHost(this.buffer, !isSpecial(this.url))

      if (host === FAILURE) {
        return FAILURE
      }

      this.url.host = host as string
      this.buffer = ''

      this.next = this.parsePort
      return
    }

    if (
      isNaN(code) ||
      codepoints('/', '?', '#').includes(code) ||
      (isSpecial(this.url) && code === codepoint('\\'))
    ) {
      this.cursor -= 1

      if (isSpecial(this.url) && this.buffer === '') {
        this.parseError = true
        return FAILURE
      }

      if (
        this.startWith &&
        this.buffer === '' &&
        (includesCredentials(this.url) || this.url.port !== undefined)
      ) {
        this.parseError = true
        return STOP_PROCESSING
      }

      const host = parseHost(this.buffer, !isSpecial(this.url))
      if (host === FAILURE) {
        return FAILURE
      }

      this.url.host = host as string
      this.buffer = ''
      this.next = this.parsePathStart

      if (this.startWith) {
        return STOP_PROCESSING
      }

      return
    }

    if (code === codepoint('[')) {
      this.encounteredArray = true
    } else if (code === codepoint(']')) {
      this.encounteredArray = false
    }

    this.buffer += character
  }

  parsePort(code: number, character?: string) {
    if (isASCIIDigit(code)) {
      this.buffer += character
      return
    }

    if (
      isNaN(code) ||
      codepoints('/', '?', '#').includes(code) ||
      (isSpecial(this.url) && code === codepoint('\\')) ||
      this.startWith
    ) {
      if (this.buffer !== '') {
        const port = Number(this.buffer)
        if (port > 2 ** 16 - 1) {
          this.parseError = true
          return FAILURE
        }

        this.url.port = port === defaultPort(this.url.scheme) ? undefined : port
        this.buffer = ''
      }

      if (this.startWith) {
        return STOP_PROCESSING
      }

      this.next = this.parsePathStart
      this.cursor -= 1
      return
    }

    this.parseError = true
    return FAILURE
  }

  private peek(places: number) {
    return this.codepoints[this.cursor + places]
  }

  private followedBy(chars: string): boolean {
    return [...chars].every(
      (char, index) => this.codepoints[this.cursor + index + 1] === codepoint(char)
    )
  }

  private getParser(symbol: ParserSymbol): ParserFunction {
    const [key] = Object.entries(Parsers).find(([, value]) => value === symbol) ?? []

    return this[`parse${key}` as never]
  }
}

export function parseURL(
  input: string,
  options: {
    base?: URLRecord | null
    url?: URLRecord | null
    encoding?: string
    startWith?: ParserSymbol
  } = {}
) {
  const stateMachine = new ParsingStateMachine({
    input,
    ...options,
  })

  return stateMachine.failure ? null : stateMachine.url
}
