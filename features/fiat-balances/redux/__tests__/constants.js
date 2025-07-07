import { createFiatNumberUnit } from './utils.js'

export const FIAT_BALANCES_PAYLOAD = {
  totals: {
    balance: createFiatNumberUnit(100),
  },
  byWalletAccount: {
    exodus_0: { balance: createFiatNumberUnit(80) },
    exodus_1: { balance: createFiatNumberUnit(20) },
  },
  byAssetSource: {
    exodus_0: {
      bitcoin: { balance: createFiatNumberUnit(40) },
      ethereum: { balance: createFiatNumberUnit(20) },
      algorand: { balance: createFiatNumberUnit(10) },
      tetherusd_algorand: { balance: createFiatNumberUnit(10) },
    },
    exodus_1: {
      solana: { balance: createFiatNumberUnit(10) },
      algorand: { balance: createFiatNumberUnit(5) },
      tetherusd_algorand: { balance: createFiatNumberUnit(5) },
    },
  },
  byBaseAssetSource: {
    exodus_0: {
      bitcoin: { balance: createFiatNumberUnit(40) },
      ethereum: { balance: createFiatNumberUnit(20) },
      algorand: { balance: createFiatNumberUnit(20) },
    },
    exodus_1: {
      solana: { balance: createFiatNumberUnit(10) },
      algorand: { balance: createFiatNumberUnit(10) },
    },
  },
}

export const OPTIMISTIC_FIAT_BALANCES_PAYLOAD = {
  totals: {
    balance: createFiatNumberUnit(120),
  },
  byWalletAccount: {
    exodus_0: { balance: createFiatNumberUnit(100) },
    exodus_1: { balance: createFiatNumberUnit(20) },
  },
  byAssetSource: {
    exodus_0: {
      bitcoin: { balance: createFiatNumberUnit(60) },
      ethereum: { balance: createFiatNumberUnit(20) },
      algorand: { balance: createFiatNumberUnit(10) },
      tetherusd_algorand: { balance: createFiatNumberUnit(10) },
    },
    exodus_1: {
      solana: { balance: createFiatNumberUnit(10) },
      algorand: { balance: createFiatNumberUnit(5) },
      tetherusd_algorand: { balance: createFiatNumberUnit(5) },
    },
  },
  byBaseAssetSource: {
    exodus_0: {
      bitcoin: { balance: createFiatNumberUnit(40) },
      ethereum: { balance: createFiatNumberUnit(20) },
      algorand: { balance: createFiatNumberUnit(20) },
    },
    exodus_1: {
      solana: { balance: createFiatNumberUnit(10) },
      algorand: { balance: createFiatNumberUnit(10) },
    },
  },
}
