import { CookieJar } from '../index'

export function clearByName(this: CookieJar, host: string, name: string): Promise<unknown> {
  /* Android does not support removing a cookie by name, we have to keep an
   * eye on this and see if this has any unexpected consequences.
   * An alternative implementation could be to get all cookies, remove them
   * from the cookie store and write only the ones back that don't match "name" */
  return this.set(
    {
      name,
      value: '',
    },
    host
  )
}
