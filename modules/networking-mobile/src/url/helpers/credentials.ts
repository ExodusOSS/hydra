import { URLRecord } from './types'
import { isUserinfoPercentEncode, utf8PercentEncodeString } from './encoding'
import { hasOpaquePath } from './path'

export function includesCredentials(url: URLRecord): boolean {
  return !!url.username || !!url.password
}

export function cannotHaveCredentialsOrPort(url: URLRecord): boolean {
  return url.host === undefined || url.host === '' || hasOpaquePath(url) || url.scheme === 'file'
}

export function setUsername(url: URLRecord, username: string): void {
  url.username = utf8PercentEncodeString(username, isUserinfoPercentEncode) // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
}

export function setPassword(url: URLRecord, password: string): void {
  url.password = utf8PercentEncodeString(password, isUserinfoPercentEncode) // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
}
