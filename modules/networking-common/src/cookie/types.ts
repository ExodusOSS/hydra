export type BaseCookie = {
  name: string
  value?: string
}

export type Cookie = BaseCookie & {
  path?: string
  domain?: string
  version?: string
  expires?: Date
  secure?: boolean
  httpOnly?: boolean
  maxAge?: number
  protocol?: string
}

export type GetOptions<TURL extends string | undefined> = TURL extends string
  ? { name?: string; path?: string; url: TURL }
  : { name: string }

export type GetAllOptions<TURL extends string | undefined> = TURL extends string
  ? { url: TURL }
  : undefined

export type RemoveOptions<TURL extends string | undefined> = GetOptions<TURL>

type WithUrl = string
type NameOnly = undefined
type NoOptions = undefined

export interface CookieJar<
  RestrictedAccess extends boolean = false,
  Get = GetOptions<RestrictedAccess extends true ? NameOnly : WithUrl>,
  GetReturns extends BaseCookie | undefined | BaseCookie[] = RestrictedAccess extends true
    ? BaseCookie | undefined
    : Cookie[],
  GetAll = GetAllOptions<RestrictedAccess extends true ? NoOptions : WithUrl>,
  GetAllReturns extends BaseCookie[] = RestrictedAccess extends true ? BaseCookie[] : Cookie[],
  Remove = RemoveOptions<RestrictedAccess extends true ? NameOnly : WithUrl>
> {
  /**
   * Sets a cookie
   * @param cookie string from Set-Cookie header or Cookie object
   * @param url Not available in RestrictedAccess implementations of the CookieJar
   */
  set(
    cookie: string | Cookie,
    url: RestrictedAccess extends true ? undefined : string
  ): Promise<void>

  /**
   * Get a cookie/multiple cookies filtered by the provided criteria
   * @param opts
   */
  get(opts: Get): Promise<GetReturns>

  /**
   * Get all cookies (for a URL)
   * @param opts
   */
  getAll(opts?: GetAll): Promise<GetAllReturns>

  /**
   * Removes all cookies for a URL, path, name or combination thereof.
   * @param opts
   */
  remove(opts: Remove): Promise<void>

  /**
   * Removes all cookies
   */
  removeAll(): Promise<void>
}
