import { UnitType } from '@exodus/currency'
import KeyIdentifier from '@exodus/key-identifier'
import {
  AccountState,
  FiatOrder,
  FiatOrderSet,
  OrderSet,
  PersonalNoteSet,
  Tx,
  TxSet,
  UtxoCollection,
} from '@exodus/models'

import createAssetsForTesting from './assets-for-testing.js'

const { assets } = createAssetsForTesting()

export const bitcoin = assets.bitcoin
export const ethereum = assets.ethereum
export const solana = assets.solana

export const SOL = UnitType.create({
  Lamports: 0,
  SOL: 9,
})

export const personalNoteSet = PersonalNoteSet.fromArray([
  {
    txId: 'aaaa',
    message: 'buying unhealthy food',
  },
  {
    txId: 'bbbb',
    message: 'trading bitcoin for scam coins',
  },
  {
    txId: 'cccc',
    message: 'trading scam coins back to bitcoin',
  },
  {
    txId: 'dddd',
    message: 'got a hot tip from grandpa',
  },
  {
    txId: 'eeee',
    message: 'buying unhealthy food',
  },
])

export const utxoCollection = UtxoCollection.fromJSON(
  {
    '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT': {
      address: '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT',
      path: 'm/0/0',
      utxos: [
        {
          txId: '27abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639',
          confirmations: 1865,
          value: '10.5 BTC',
          vout: 0,
          script: null,
        },
      ],
    },
  },
  { currency: bitcoin.currency }
)

const txs = [
  {
    txId: 'txId',
    error: null,
    date: '2017-03-12T20:52:24.000Z',
    confirmations: 1,
    meta: {},
    token: null,
    coinAmount: '-100 ETH',
    coinName: 'ethereum',
    feeAmount: '0.000462 ETH',
    feeCoinName: 'ethereum',
    to: '0x90ef2fa55463d8815b6e8c3e585e78b04718952d',
    currencies: { ethereum: ethereum.currency },
  },
]

export const txSet = TxSet.fromArray(txs)

export const tx = Tx.fromJSON(txs[0])

export const orderSet = OrderSet.fromArray([
  {
    orderId: '3ii8id85002zh62npv',
    status: 'complete-verified',
    date: '2022-07-21T07:45:37.223Z',
    fromTxId: '0x85cb626fb97e9341d72fc58714b1fe4f593e3baf6d5ab5b3aa42102fb7b3d6f9',
    toTxId: 'QEPB3LKNV34LXSWF3D2DVDN3PPHLH3QIEOHGQKDMUJUXUTXNFE4Q',
    fromAsset: 'ethereum',
    fromAmount: {
      t: 'numberunit',
      v: {
        v: '0.07630936966690594 ETH',
        u: {
          wei: 0,
          Kwei: 3,
          Mwei: 6,
          Gwei: 9,
          szabo: 12,
          finney: 15,
          ETH: 18,
        },
      },
    },
    toAsset: 'algorand',
    toAmount: {
      t: 'numberunit',
      v: {
        v: '325.795661 ALGO',
        u: {
          microAlgo: 0,
          ALGO: 6,
        },
      },
    },
    fromWalletAccount: 'exodus_0',
    toWalletAccount: 'exodus_0',
    svc: 'aero',
    synced: true,
    _version: 1,
  },
])

export const fiatOrderSet = FiatOrderSet.fromArray([
  FiatOrder.fromJSON({
    date: '2023-07-06T08:41:06.541Z',
    exodusRate: 1.084_99,
    fromAmount: 2,
    fees: {
      networkFee: 0,
      providerFee: 2.05,
      processingFee: 0,
      totalFee: 2.559_999_999_999_999_6,
    },
    fiatValue: 40.35,
    fromAddress: 'tb1q8k9pw7yvrzurm4fs8wmmkyqwdkcvh5d7xmujj2',
    fromAsset: 'bitcoin',
    fromWalletAccount: 'exodus_0',
    orderId: 'b370924a-79cb-4889-97a7-7a3c23625024',
    orderType: 'sell',
    provider: 'moonpay',
    providerOrderId: '5cd78be4-ec5c-46a4-90d2-3f525c50308b',
    providerRate: 1.084_99,
    status: 'completed',
    toAddress: null,
    toAmount: 40.35,
    toAsset: 'EUR',
    toWalletAccount: 'exodus_0',
    txId: 'c159af6b1386a73543878a44ceef04a5da89cf9c22317e2cf6664fa7eb441359',
  }),
])

export const keyIdentifier = new KeyIdentifier({
  derivationPath: "m/44'/60'/0'",
  derivationAlgorithm: 'BIP32',
  keyType: 'secp256k1',
})

export class SomeAccountState extends AccountState {
  static defaults = {
    utxos: UtxoCollection.createEmpty({
      currency: bitcoin.currency,
    }),
    tokenUtxos: {},
    mem: {
      unclaimed: bitcoin.currency.ZERO,
    },
  }
}

export const accountState = new SomeAccountState({
  mem: { unclaimed: bitcoin.currency.baseUnit(1000) },
})
