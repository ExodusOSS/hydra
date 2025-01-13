import {
  Cookie,
  CookieJar as CookieJarSpec,
  GetAllOptions,
  GetOptions,
  RemoveOptions,
  validate,
} from '@exodus/networking-common/cookie'
import CookieManager, {
  Cookie as NativeCookie,
  CookieManagerStatic,
} from '@react-native-cookies/cookies'
import { OperatingSystem } from '../shared/types'
import platformCode from './os'

// the getAll implementation actually resolves an NSArray and not an NSDictionary
export type PatchedCookieManagerStatic = Omit<CookieManagerStatic, 'getAll'> & {
  getAll: (useWebKit?: boolean) => Promise<NativeCookie[]>
}
const PatchedCookieManager = CookieManager as unknown as PatchedCookieManagerStatic

type WithUrl = string

export default class CookieJar implements CookieJarSpec {
  constructor(
    private os: OperatingSystem,
    protected store: PatchedCookieManagerStatic = PatchedCookieManager
  ) {}

  /**
   * Returns all cookies for the given url and name, or path, or combination thereof.
   * @param opts Object with url, name, path properties
   */
  async get(opts: GetOptions<WithUrl>): Promise<Cookie[]> {
    const cookies = Object.values(await this.store.get(opts.url, true))

    return cookies
      .filter(({ name, path }) => {
        if (opts.path && opts.path !== path) {
          return false
        }

        return !opts.name || opts.name === name
      })
      .map(({ expires, ...rest }) => ({
        ...rest,
        expires: expires ? new Date(expires) : undefined,
      }))
  }

  /**
   * Removes a cookies for the given name, url, and path.
   * @Param options.url
   * @param options.name name of the cookie
   * @Param options.path Optional path of the cookie
   */
  async remove({ url, name, path }: RemoveOptions<WithUrl>): Promise<void> {
    await Promise.all(
      Object.values(await this.store.get(url, true))
        .filter(({ name: n, path: p }) => (!name || name === n) && (!path || path === p))
        .map(({ name }) => this.clearByName(url, name))
    )
  }

  async getAll(opts?: GetAllOptions<WithUrl>): Promise<Cookie[]> {
    const cookies = opts?.url
      ? await this.store.get(opts.url).then(Object.values)
      : await this.store.getAll(true)

    return cookies.map(asCookie)
  }

  /**
   * Empties the entire cookie jar
   */
  async removeAll(): Promise<void> {
    await this.store.clearAll(true)
  }

  /**
   * Set a cookie for the given host.
   * @param cookie The cookie
   * @param url Required on mobile
   */
  async set(cookie: string | Cookie, url?: string): Promise<void> {
    if (!url) {
      throw new Error('Host is required')
    }

    if (typeof cookie === 'string') {
      await this.store.setFromResponse(url, cookie)
      return
    }

    validate(cookie)

    await this.store.set(url, asNativeCookie(cookie), true)
  }

  private clearByName = platformCode[this.os].clearByName.bind(this)
}

function asCookie({ expires, ...rest }: NativeCookie): Cookie {
  return {
    ...rest,
    expires: expires ? new Date(expires) : undefined,
  }
}

function asNativeCookie({ expires, value, ...rest }: Cookie): NativeCookie {
  return {
    ...rest,
    value: value ?? '',
    expires: expires?.toUTCString(),
  }
}
