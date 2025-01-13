import serialize from './serialize'
import { Cookie } from './types'

describe('serialize', () => {
  const cookies: {
    cookie: Cookie
    serialization?: string
  }[] = [
    { cookie: { name: 'value-cookie', value: 'value' }, serialization: 'value-cookie=value' },
    {
      cookie: { name: 'max-age-cookie', value: 'value', maxAge: 0 },
      serialization: 'max-age-cookie=value; Max-Age=0',
    },
    {
      cookie: { name: 'boolean-cookie', value: 'value', httpOnly: true, secure: true },
      serialization: 'boolean-cookie=value; HttpOnly; Secure',
    },
    {
      cookie: {
        name: 'full-cookie',
        value: 'value',
        domain: 'wayne-enterprises.com',
        expires: new Date('Wed, 02 Nov 2022 08:01:33 GMT'),
        httpOnly: true,
        secure: true,
        maxAge: 0,
      },
      serialization:
        'full-cookie=value; Domain=wayne-enterprises.com; Expires=Wed, 02 Nov 2022 08:01:33 GMT; HttpOnly; Secure; Max-Age=0',
    },
  ]

  cookies.forEach(({ cookie, serialization }) => {
    it(`should serialize ${cookie.name}`, () => {
      expect(serialize(cookie)).toEqual(serialization)
    })
  })
})
