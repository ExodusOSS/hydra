import { UnitType } from '@exodus/currency'
import { AccountState } from '@exodus/models'

import type { Asset, AssetsByName, BatchingChanges, BatchingReducerContext } from '../../types.js'

class BitcoinAccountState extends AccountState {
  static defaults = {
    cursor: '',
    balance: '0 BTC',
  }
}

class EthereumAccountState extends AccountState {
  static defaults = {
    cursor: '',
    balance: '0 ETH',
  }
}

export const AccountStates: Record<'bitcoin' | 'ethereum', typeof AccountState> = {
  bitcoin: BitcoinAccountState,
  ethereum: EthereumAccountState,
}

export const createEmptyChanges = (): BatchingChanges => ({
  accountStates: Object.create(null),
  txLogs: Object.create(null),
  newlyReceivedTxLogs: Object.create(null),
})

export const createAction = <Payload>(payload: Payload) => ({
  type: Symbol('test'),
  payload,
})

// allow: minimal test stub — only the fields the reducers actually read are populated
const testAsset = {
  name: 'bitcoin',
  currency: UnitType.create({ satoshis: 0, BTC: 8 }),
  get baseAsset(): Asset {
    return testAsset as unknown as Asset // allow: test fixture
  },
  get feeAsset(): Asset {
    return testAsset as unknown as Asset // allow: test fixture
  },
  api: { createAccountState: () => AccountStates.bitcoin },
} as unknown as Asset // allow: test fixture
const testAssets: AssetsByName = { bitcoin: testAsset }

export const createReducerContext = (
  overrides: Partial<BatchingReducerContext> = {}
): BatchingReducerContext => ({
  getAsset: () => testAsset,
  getAssets: () => testAssets,
  // oxlint-disable-next-line unicorn/no-useless-undefined -- typed callbacks require explicit undefined return; () => {} is void, not TxSet | undefined
  getCachedTxLog: () => undefined,
  // oxlint-disable-next-line unicorn/no-useless-undefined -- typed callbacks require explicit undefined return; () => {} is void, not AccountState | undefined
  getCachedAccountState: () => undefined,
  ...overrides,
})
