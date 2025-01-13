import { URLRecord } from './types'
import { serializeHost } from './host'
import { parseURL } from './state-machine'
import { hasOpaquePath } from './path'

export function serializeURL(url: URLRecord, excludeFragment = false): string {
  let href = `${url.scheme}:`
  if (url.host !== undefined) {
    href += `//`

    if (url.username || url.password) {
      href += url.username ?? ''

      if (url.password) {
        href += `:${url.password}`
      }
      href += '@'
    }

    href += serializeHost(url.host)

    if (url.port !== undefined) {
      href += `:${url.port}`
    }
  }

  if (url.host === undefined && !hasOpaquePath(url) && url.path.length > 1 && url.path[0] === '') {
    href += '/.'
  }
  href += serializePath(url)

  if (url.query !== undefined) {
    href += `?${url.query}`
  }

  if (!excludeFragment && url.fragment !== undefined) {
    href += `#${url.fragment}`
  }

  return href
}

export function serializePath(url: URLRecord): string {
  if (hasOpaquePath(url)) {
    return url.path as string
  }

  let path = ''
  for (const segment of url.path) {
    path += `/${segment}`
  }
  return path
}

export function serializeOrigin(url: { scheme: string; host: string; port?: number }) {
  let result = `${url.scheme}://${serializeHost(url.host)}`

  if (url.port !== undefined) {
    result += `:${url.port}`
  }

  return result
}

export function serializeURLOrigin(url: URLRecord): string {
  // https://url.spec.whatwg.org/#concept-url-origin
  switch (url.scheme) {
    case 'blob':
      try {
        const parsed = parseURL(serializePath(url))
        return parsed ? serializeURLOrigin(parsed) : 'null'
      } catch {
        // serializing an opaque origin returns "null"
        return 'null'
      }
    case 'ftp':
    case 'http':
    case 'https':
    case 'ws':
    case 'wss':
      return serializeOrigin({
        scheme: url.scheme,
        host: url.host ?? '',
        port: url.port,
      })
    case 'file':
      // The spec says:
      // > Unfortunate as it is, this is left as an exercise to the reader. When in doubt, return a new opaque origin.
      // Browsers tested so far:
      // - Chrome says "file://", but treats file: URLs as cross-origin for most (all?) purposes; see e.g.
      //   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
      // - Firefox says "null", but treats file: URLs as same-origin sometimes based on directory stuff; see
      //   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs
      return 'null'
    default:
      // serializing an opaque origin returns "null"
      return 'null'
  }
}
