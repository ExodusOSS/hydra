import { URLRecord } from './types'
import { isNormalizedWindowsDriveLetter } from './windows'

export function shortenPath(url: URLRecord) {
  const { path, scheme } = url
  if (path.length === 0) {
    return
  }

  if (scheme === 'file' && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
    return
  }

  if (typeof path !== 'string') {
    path.pop()
  }
}

export function hasOpaquePath(url: URLRecord) {
  return typeof url.path === 'string'
}
