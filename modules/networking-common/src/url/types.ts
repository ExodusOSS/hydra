export interface URLSearchParamsLike {
  append(name: string, value: string): void
  delete(name: string): void
  get(name: string): string | null
  getAll(name: string): string[]
  has(name: string): boolean
  set(name: string, value: string): void
  sort(): void
  toString(): string

  entries(): IterableIterator<[string, string]>
  keys(): IterableIterator<string>
  values(): IterableIterator<string>
  [Symbol.iterator](): IterableIterator<[string, string]>
}

export interface URLLike {
  hash: string
  host: string
  hostname: string
  href: string
  toString(): string
  readonly origin: string
  password: string
  pathname: string
  port: string
  protocol: string
  search: string
  readonly searchParams: URLSearchParamsLike
  username: string
  toJSON(): string
}

export type ParseUrl = (url: string | URLLike, base?: string | URLLike) => URLLike

export type ParseSearchParams = (
  init?: string[][] | Record<string, string> | string | URLSearchParamsLike
) => URLSearchParamsLike

export interface URLParser {
  parse: ParseUrl
  parseSearchParams: ParseSearchParams
}
