import lodash from 'lodash'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'

const { mapValues, pick } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const getCurrencies = (assetNames: string[]) =>
  mapValues(pick(assets, assetNames), (asset) => asset.currency)

test('should parse ERC20 fees as ETH ', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-0.001 OMG',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'omisego',
    feeAmount: '0.0001 ETH',
    feeCoinName: 'ethereum',
    currencies: getCurrencies(['ethereum', 'omisego']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'ETH')

  t.end()
})

test('should parse ERC20 fees as ETH even if they were stored as base unit', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-0.001 OMG',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'omisego',
    feeAmount: '120 wei',
    feeCoinName: 'ethereum',
    currencies: getCurrencies(['ethereum', 'omisego']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'ETH')

  t.end()
})

test('should parse VET fees as VTHO ', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-0.001 VET',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'vechainthor',
    feeAmount: '0.0001 VTHO',
    feeCoinName: 'vethor',
    currencies: getCurrencies(['vechainthor', 'vethor']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'VTHO')

  t.end()
})

// NOTE: ideally we need another test for VECHAIN_TOKEN using VTHO as gas, but the only one right now is VTHO so the test is pointless

test('should parse TRON_TOKEN fees as TRON', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-0.001 BTTNEW',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'bittorrentv2',
    feeAmount: '0.01 TRX',
    feeCoinName: 'tronmainnet',
    currencies: getCurrencies(['tronmainnet', 'bittorrentv2']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'TRX')

  t.end()
})

// Parsing this case handled by clients as of May 2021. Skipped for now, but can be (re)moved eventually.
test.skip('should parse BTT fees as TRX (old versions that used BTT as feeAmount)', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-1 BTT',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'bittorrent',
    feeAmount: '0 BTT',
    feeCoinName: 'tronmainnet',
    currencies: getCurrencies(['tronmainnet']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'TRX')

  t.end()
})

test('should parse NEO fees as GAS', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-1 NEO',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'neo',
    feeAmount: '0.01 GAS',
    feeCoinName: 'neogas',
    currencies: getCurrencies(['neo', 'neogas']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'GAS')

  t.end()
})

// Parsing this case handled by clients as of May 2021. Skipped for now, but can be (re)moved eventually.
test.skip('should parse NEO fees as GAS (old versions that used NEO as feeAmount)', (t) => {
  const tx = Tx.fromJSON({
    txId: 'txid',
    coinAmount: '-1 NEO',
    date: '2019-08-08T14:00:00.000Z',
    coinName: 'neo',
    feeAmount: '0 NEO',
    feeCoinName: 'neogas',
    currencies: getCurrencies(['neo', 'neogas']),
  })

  t.is(tx.feeAmount.defaultUnit.unitName, 'GAS')

  t.end()
})

test('should throw if fee amount is not for the asset', (t) => {
  t.throws(() => {
    Tx.fromJSON({
      txId: 'txid',
      coinAmount: '-0.001 OMG',
      date: '2019-08-08T14:00:00.000Z',
      coinName: 'omisego',
      feeAmount: '120 satoshis',
      feeCoinName: 'omisego',
      currencies: getCurrencies(['ethereum', 'omisego']),
    })
  })

  t.end()
})
