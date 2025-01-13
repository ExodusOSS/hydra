import { FormDataLike } from '../form'

export type ReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

export type RequestCredentials = 'include' | 'omit' | 'same-origin'

export type RequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin'

export type RequestRedirect = 'error' | 'follow' | 'manual'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Headers = {
  append(name: string, value: string): void
  delete(name: string): void
  get(name: string): string | null
  has(name: string): boolean
  set(name: string, value: string): void
  forEach(callbackfn: (value: string, key: string, parent?: Headers) => void, thisArg?: any): void

  entries(): IterableIterator<[string, string]>
  keys(): IterableIterator<string>
  values(): IterableIterator<string>
  [Symbol.iterator](): Iterator<[string, string]>
}

export type HeadersInit = string[][] | Record<string, string> | Headers

export type AbortSignal = {
  aborted: boolean

  addEventListener: (
    type: 'abort',
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
          capture?: boolean | undefined
          once?: boolean | undefined
          passive?: boolean | undefined
        }
  ) => void

  removeEventListener: (
    type: 'abort',
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
          capture?: boolean | undefined
        }
  ) => void

  dispatchEvent: (event: any) => boolean

  onabort: null | ((this: AbortSignal, event: any) => void)
}

export type RequestInit = {
  body?: string | null
  credentials?: RequestCredentials
  headers?: HeadersInit
  integrity?: string
  keepalive?: boolean
  method?: string
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  signal?: AbortSignal | null
  timeoutMs?: number
}

export type Response<TFormData = FormDataLike> = {
  readonly headers: Headers
  readonly ok: boolean
  readonly redirected: boolean
  readonly status: number
  readonly statusText: string
  readonly responseType?: string
  readonly url: string

  arrayBuffer(): Promise<ArrayBuffer>
  formData(): Promise<TFormData>
  json(): Promise<any>
  text(): Promise<string>
}

export type Fetch<TRequestInit, TResponse> = (
  url: string,
  init?: TRequestInit
) => Promise<TResponse>

export type CommonRequestInit = {
  method?: string
  body?: any
  timeoutMs?: number
  headers?: HeadersInit
}

export type CommonResponse = {
  headers: Headers
  json(): Promise<any>
}

export type HttpClient<
  TRequestInit extends CommonRequestInit = RequestInit,
  TResponse extends CommonResponse = Response
> = {
  fetch: Fetch<TRequestInit, TResponse>
}
