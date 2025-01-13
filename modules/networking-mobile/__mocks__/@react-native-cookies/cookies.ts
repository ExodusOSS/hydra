import { Cookie as NativeCookie, Cookies } from '@react-native-cookies/cookies'
import { PatchedCookieManagerStatic } from '../../src/cookie/cookie-jar'
import { deserialize } from '@exodus/networking-common/cookie'

const MockCookieManager: PatchedCookieManagerStatic = {
  store: new Map<string, NativeCookie[]>(),

  async set(url: string, cookie: NativeCookie): Promise<boolean> {
    const cookies = this.store.get(url)
    if (!cookies) {
      this.store.set(url, [cookie])
      return true
    }

    const index = cookies.findIndex(({ name }) => name === cookie.name)
    cookies.splice(index === -1 ? cookies.length : index, index === -1 ? 1 : 0, cookie)

    return true
  },

  async setFromResponse(url: string, headerValue: string): Promise<boolean> {
    const cookie = deserialize(headerValue) as NativeCookie
    return this.set(url, cookie)
  },

  async get(url: string): Promise<Cookies> {
    return Object.fromEntries((this.store.get(url) ?? []).map((b) => [b.name, b]))
  },

  async getFromResponse(): Promise<Cookies> {
    throw new Error('Not implemented')
  },

  async clearAll(): Promise<boolean> {
    this.store = new Map()
    return true
  },

  // Android only
  async flush(): Promise<void> {
    throw new Error('Not implemented')
  },

  async removeSessionCookies(): Promise<boolean> {
    throw new Error('Not implemented')
  },

  // iOS only
  async getAll(): Promise<NativeCookie[]> {
    return [...this.store.values()].flat()
  },

  async clearByName(url: string, name: string): Promise<boolean> {
    const filtered = this.store.get(url)?.filter((cookie) => cookie.name !== name)
    this.store.set(url, filtered ?? [])
    return true
  },
}

export default MockCookieManager
