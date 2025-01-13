import test from '../../../_test.js'
import bs58check from 'bs58check'
import Address from '../../address/index.js'
import AddressSet from '../index.js'

test('convert AddressSet to map of pubKeyHash', (t) => {
  const addr1 = Address.create('1L75eRMgeCwAxEjD1oWXjLgud9jxwxm34u')
  const addr2 = Address.create('1QGudeKKwRkaoB7aH55c9L2dj8UF6ihiCT')
  const addr3 = Address.create('17BpEbnqmDGYHCEJheLAQSvNY1sH2y1WTx')

  const set = AddressSet.fromArray([addr1, addr2, addr3])
  for (const addr of set) {
    bs58check.decode(String(addr)).slice(-20).toString('hex')
  }

  t.end()
})
