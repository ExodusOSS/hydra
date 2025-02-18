import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxsJSON } from '../utils.js'
import { txs1 } from './fixtures/legacy/index.js'

const txsA = normalizeTxsJSON({ json: txs1, assets })

test('toString() should return the TX ID', (t) => {
  const txs = txsA.map(Tx.fromJSON)

  t.is(
    String(txs[3]),
    '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247',
    'tx id is the string'
  )
  t.is(
    txs[3].toString(),
    '90666373b49cb838b336b9c25e3d0e0c7b8fff1bcabcd173b3115bd0b24de247',
    'tx id is the string'
  )

  t.end()
})
