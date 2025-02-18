import assert from 'minimalistic-assert'
import lodash from 'lodash'
import type { UnitType } from '@exodus/currency'
import type { TxProps } from './index.js'
import type { Asset } from '../types.js'

const { mapValues, uniqBy, isEmpty, isArray } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const unitTypeToJSON = (ut: UnitType) => mapValues(ut.units, (u) => u.power)

// For migrating from legacy format while reading from storage
// Currently only needed for tests
export function normalizeTxJSON({ json, asset }: { json: any; asset?: Asset }): TxProps {
  assert(json, 'normalizeTxJSON: `json` object is required')

  if (json.version !== undefined) return json // not a legacy tx

  assert(
    !json.coinAmount || json.coinName,
    'normalizeTxJSON: `coinName` is required with `coinAmount`'
  )
  assert(asset, 'normalizeTxJSON: `asset` object and `coinName` are required')

  const updated = { ...json, version: 1 }
  if (json.feeAmount && !json.feeCoinName) {
    updated.feeCoinName = asset.feeAsset.name
  }

  if (!json.currencies) {
    updated.currencies = mapValues(currenciesForAsset(asset), unitTypeToJSON)
  }

  return { ...json, ...updated }
}

// Migrate an array of txs
export function normalizeTxsJSON({
  json,
  assets,
}: {
  json?: any[]
  assets: { [assetName: string]: Asset }
}) {
  if (!json) return []
  assert(isArray(json), 'normalizeTxsJSON: `json` array is required')
  assert(assets, 'normalizeTxJSON: `assets` object is required')
  return json.map((tx) => {
    return normalizeTxJSON({ json: tx, asset: tx.coinName ? assets[tx.coinName] : undefined })
  })
}

export const ensureCurrencies = (json: TxProps, assets: { [assetName: string]: Asset }) => {
  if (!isEmpty(json.currencies)) return json
  assert(assets, "ensureCurrencies: expected `assets` when `json` doesn't contain `currencies`")
  assert(json.coinName, 'ensureCurrencies: expected `json.coinName`')
  assert(assets[json.coinName], `ensureCurrencies: asset not found for ${json.coinName}`)

  return { ...json, currencies: currenciesForAsset(assets[json.coinName]) }
}

function assetsForAsset(asset: Asset) {
  return Object.fromEntries(
    uniqBy([asset, asset.baseAsset, asset.feeAsset], (asset) => asset.name).map((asset) => [
      asset.name,
      asset,
    ])
  )
}

// Helper for populating the constructor 'currencies' argument
export function currenciesForAsset(asset: Asset) {
  return mapValues(assetsForAsset(asset), (asset) => asset.currency)
}
