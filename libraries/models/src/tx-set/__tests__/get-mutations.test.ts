import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'
import { golemTxset as _golemSet, txset as _set } from './fixtures/index.js'

const set = normalizeTxsJSON({ json: _set, assets })
const golemSet = normalizeTxsJSON({ json: _golemSet, assets })

test('getMutations() should return an array of mutations sorted by date', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(set)
  const balances = [0.3, 0.099_538, 0.098_728_752, 0.098_728_752, 0.098_728_752, 0]
  const mutations = txset.getMutations()

  t.same(
    mutations.map((mutation) => mutation.balance.toDefaultNumber()),
    balances,
    'correct balances'
  )
  t.same(
    TxSet.fromArray(mutations.map((mutation) => mutation.tx)),
    TxSet.fromArray(set),
    'correct txs'
  )

  t.end()
})

test('getMutations() should handle ERC20 transactions', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(golemSet)
  const balances = [71.230_671_71, 0]
  const mutations = txset.getMutations()

  t.same(
    mutations.map((mutation) => mutation.balance.toDefaultNumber()),
    balances,
    'correct balances'
  )
  t.same(
    TxSet.fromArray(mutations.map((mutation) => mutation.tx)),
    TxSet.fromArray(golemSet),
    'correct txs'
  )

  t.end()
})
