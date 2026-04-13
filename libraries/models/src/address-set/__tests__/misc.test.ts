import { fromBase58checkSync } from '@exodus/bytes/base58check.js'
import { toHex } from '@exodus/bytes/hex.js'

import test from '../../__tests__/_test.js'
import Address from '../../address/index.js'
import AddressSet from '../index.js'

test('convert AddressSet to map of pubKeyHash', (t) => {
  const addr1 = Address.create('1L75eRMgeCwAxEjD1oWXjLgud9jxwxm34u')
  const addr2 = Address.create('1QGudeKKwRkaoB7aH55c9L2dj8UF6ihiCT')
  const addr3 = Address.create('17BpEbnqmDGYHCEJheLAQSvNY1sH2y1WTx')

  const set = AddressSet.fromArray([addr1, addr2, addr3])
  for (const addr of set) {
    toHex(fromBase58checkSync(String(addr)).subarray(-20))
  }

  t.end()
})
