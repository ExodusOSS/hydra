import type { BalanceFieldName, Balances as AssetBalances } from '@exodus/asset-types'
import type { Atom } from '@exodus/atoms'
import type NumberUnit from '@exodus/currency'

declare const balances: (walletConfig?: Record<string, unknown>) => {
  id: string
  definitions: unknown[]
}

export type Balances = Partial<AssetBalances>

type WalletAccountName = string

type AssetName = string

export type BalancesByAssetSource = Record<WalletAccountName, Record<AssetName, Balances>>

export type BalanceChange = {
  from: NumberUnit
  to: NumberUnit
}

export type BalanceChanges = Record<
  WalletAccountName,
  Record<AssetName, Partial<Record<BalanceFieldName, BalanceChange>>>
>

export type BalancesAtomValue = {
  balances: BalancesByAssetSource
  changes?: BalanceChanges
}

export type BalancesAtom = Atom<BalancesAtomValue>

export default balances
