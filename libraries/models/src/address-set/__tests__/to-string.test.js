import test from '../../../_test.js'
import AddressSet from '../index.js'
import Address from '../../address/index.js'

test('toString() should return a comma separated string of addresses', (t) => {
  const addr1 = Address.create('1L75eRMgeCwAxEjD1oWXjLgud9jxwxm34u')
  const addr2 = Address.create('1QGudeKKwRkaoB7aH55c9L2dj8UF6ihiCT')
  const addr3 = Address.create('17BpEbnqmDGYHCEJheLAQSvNY1sH2y1WTx')

  const set = AddressSet.fromArray([addr1, addr2, addr3])
  t.is(String(set), `${addr1}, ${addr2}, ${addr3}`, 'comma separated addresses')

  t.end()
})
