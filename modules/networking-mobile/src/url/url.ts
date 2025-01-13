import { URLLike } from '@exodus/networking-common/url'
import { Parsers, parseURL } from './helpers/state-machine'
import { URLRecord } from './helpers/types'
import { serializePath, serializeURL, serializeURLOrigin } from './helpers/serializer'
import { cannotHaveCredentialsOrPort, setPassword, setUsername } from './helpers/credentials'
import { serializeHost } from './helpers/host'
import URLSearchParams from './url-search-params'
import { hasOpaquePath } from './helpers/path'

export default class URL implements URLLike {
  private url: URLRecord
  private params: URLSearchParams

  constructor(url: string | URLLike, base?: string | URLLike | null) {
    let parsedBase: URLRecord | null = null
    if (base !== undefined && base !== null) {
      parsedBase = parseURL(base.toString())
      if (parsedBase === null) {
        throw new TypeError(`Invalid base URL: ${base.toString()}`)
      }
    }

    const parsedURL = parseURL(url.toString(), { base: parsedBase })
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${url.toString()}`)
    }

    const query = parsedURL.query || ''

    this.url = parsedURL

    this.params = new URLSearchParams(query)
    this.params.onChange = this.updateQuery.bind(this)
  }

  private updateQuery(): void {
    this.url.query = this.params.toString() || undefined
  }

  get href() {
    return serializeURL(this.url)
  }

  set href(href) {
    const parsedURL = parseURL(href)
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${href}`)
    }

    this.url = parsedURL

    this.params = new URLSearchParams(this.url.query ?? [])
    this.params.onChange = this.updateQuery.bind(this)
  }

  get origin() {
    return serializeURLOrigin(this.url)
  }

  get protocol() {
    return `${this.url.scheme}:`
  }

  set protocol(protocol) {
    parseURL(`${protocol}:`, { url: this.url, startWith: Parsers.SchemeStart })
  }

  get username() {
    return this.url.username ?? ''
  }

  set username(username) {
    if (cannotHaveCredentialsOrPort(this.url)) {
      return
    }

    setUsername(this.url, username)
  }

  get password() {
    return this.url.password ?? ''
  }

  set password(password) {
    if (cannotHaveCredentialsOrPort(this.url)) {
      return
    }

    setPassword(this.url, password)
  }

  get host() {
    const { host, port } = this.url

    if (host === undefined) {
      return ''
    }

    if (port === undefined) {
      return serializeHost(host)
    }

    return `${serializeHost(host)}:${port}`
  }

  set host(host) {
    if (hasOpaquePath(this.url)) {
      return
    }

    parseURL(host, { url: this.url, startWith: Parsers.Host })
  }

  get hostname() {
    if (this.url.host === undefined) {
      return ''
    }

    return serializeHost(this.url.host)
  }

  set hostname(v) {
    if (hasOpaquePath(this.url)) {
      return
    }

    parseURL(v, { url: this.url, startWith: Parsers.Hostname })
  }

  get port() {
    const { port } = this.url

    return port?.toString() ?? ''
  }

  set port(port) {
    if (cannotHaveCredentialsOrPort(this.url)) {
      return
    }

    if (port === '') {
      this.url.port = undefined
      return
    }

    parseURL(port, { url: this.url, startWith: Parsers.Port })
  }

  get pathname() {
    return serializePath(this.url)
  }

  set pathname(v) {
    if (hasOpaquePath(this.url)) {
      return
    }

    this.url.path = []
    parseURL(v, { url: this.url, startWith: Parsers.PathStart })
  }

  get search() {
    if (!this.url.query) {
      return ''
    }

    return `?${this.url.query}`
  }

  set search(search) {
    const url = this.url

    if (search === '') {
      this.url.query = undefined
      this.params = new URLSearchParams([])
      this.params.onChange = this.updateQuery.bind(this)
      return
    }

    const input = search[0] === '?' ? search.slice(1) : search
    url.query = ''
    parseURL(input, { url, startWith: Parsers.Query })

    this.params = new URLSearchParams(input)
    this.params.onChange = this.updateQuery.bind(this)
  }

  get searchParams() {
    return this.params
  }

  get hash() {
    const { fragment } = this.url
    if (!fragment) {
      return ''
    }

    return `#${fragment}`
  }

  set hash(hash) {
    if (hash === '') {
      this.url.fragment = undefined
      return
    }

    const input = hash[0] === '#' ? hash.slice(1) : hash
    this.url.fragment = ''
    parseURL(input, { url: this.url, startWith: Parsers.Fragment })
  }

  toString() {
    return this.href
  }

  toJSON() {
    return this.href
  }
}
