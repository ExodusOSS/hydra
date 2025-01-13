import { createInMemoryAtom } from '@exodus/atoms'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { TxSet } from '@exodus/models'

const currencies = { bitcoin: bitcoin.currency }

const txs = {
  trezor_0_69b383b8477be56d6ff5ba24cff0c24e: {
    bitcoin: TxSet.fromArray([
      {
        coinName: 'bitcoin',
        txId: '1',
        addresses: [
          {
            address: 'a',
            meta: { path: 'm/0/0', purpose: 44 },
          },
          {
            address: 'b',
            meta: { path: 'm/0/1', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-1',
            meta: { path: 'm/1/0', purpose: 44 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '2',
        addresses: [
          {
            address: 'c',
            meta: { path: 'm/0/2', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-2',
            meta: { path: 'm/1/1', purpose: 44 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '3',
        addresses: [
          {
            address: 'e',
            meta: { path: 'm/0/0', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-3',
            meta: { path: 'm/1/2', purpose: 44 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '4',
        addresses: [
          {
            address: 'e',
            meta: { path: 'm/0/0', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-4',
            meta: { path: 'm/1/3', purpose: 44 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '5',
        addresses: [
          {
            address: 'e',
            meta: { path: 'm/0/0', purpose: 44 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-5',
            meta: { path: 'm/1/4', purpose: 44 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '49-1',
        addresses: [
          {
            address: '49-spend-0',
            meta: { path: 'm/0/0', purpose: 49 },
          },
          {
            address: '49-spend-1',
            meta: { path: 'm/0/1', purpose: 49 },
          },
          {
            address: '49-spend-2',
            meta: { path: 'm/0/2', purpose: 49 },
          },
        ],
        data: {
          changeAddress: {
            address: '49-change-0',
            meta: { path: 'm/1/0', purpose: 49 },
          },
        },
        currencies,
      },
      {
        coinName: 'bitcoin',
        txId: '84-1',
        addresses: [
          {
            address: '84-a',
            meta: { path: 'm/0/0', purpose: 84 },
          },
          {
            address: '84-b',
            meta: { path: 'm/0/1', purpose: 84 },
          },
        ],
        data: {
          changeAddress: {
            address: 'change-84-1',
            meta: { path: 'm/1/0', purpose: 84 },
          },
        },
        currencies,
      },
    ]),
  },
}

export function createTxLogsAtom() {
  return createInMemoryAtom({ defaultValue: { value: txs } })
}
