import { URLSearchParamsLike } from '@exodus/networking-common/url'

export type URLRecord = {
  scheme?: string
  username?: string
  password?: string
  host?: string
  port?: number
  path: string | string[]
  query?: string
  fragment?: string
}

export function isURLSearchParamsLike(
  object: URLSearchParamsLike | Record<string, string>
): object is URLSearchParamsLike {
  return ['append', 'delete', 'get', 'getAll', 'has', 'set', 'sort'].every(
    (property) => property in object
  )
}
