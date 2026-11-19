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

test('getMutations() should warn once when many balances are negative', (t) => {
  const [firstTx] = TxSet.fromArray(set).getMutations()
  const txset = TxSet.fromArray(set.filter((tx) => tx.txId !== firstTx!.tx.txId))
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const mutations = txset.getMutations()

  t.true(
    mutations.every((mutation) => mutation.balance.isNegative),
    'every balance is negative without the first receive'
  )
  t.is(warn.mock.calls.length, 1, 'warns once')
  t.same(
    warn.mock.calls[0]!.slice(0, 1),
    ['negative balance in mutations calculation'],
    'keeps the message'
  )

  warn.mockRestore()
  t.end()
})

test('getMutations() should still warn about negative balances after a failed calculation', (t) => {
  const [, golemMutation] = TxSet.fromArray(golemSet).getMutations()
  const golemSend = golemMutation!.tx.update({ txId: 'negative-send-before-failure' })
  const [lastEthTx] = [...TxSet.fromArray(set).reverse()]
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

  t.throws(() => TxSet.fromArray([golemSend, lastEthTx!]).getMutations())
  warn.mockClear()
  TxSet.fromArray([golemSend]).getMutations()
  t.same(
    warn.mock.calls.map(([message]) => message),
    ['negative balance in mutations calculation'],
    'warns for the negative tx the failed calculation reached'
  )

  warn.mockRestore()
  t.end()
})

test('getMutations() should handle ERC20 transactions', (t) => {
  t.plan(2)

  const txset = TxSet.fromArray(golemSet)
  const balances = [71.230_671, 0]
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
