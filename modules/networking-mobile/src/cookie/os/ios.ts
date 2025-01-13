import { CookieJar } from '../index'

export function clearByName(this: CookieJar, host: string, name: string): Promise<unknown> {
  return this.store.clearByName(host, name)
}
