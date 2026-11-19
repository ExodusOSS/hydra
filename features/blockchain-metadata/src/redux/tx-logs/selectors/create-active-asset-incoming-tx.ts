// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'
import type { Tx, TxSet } from '../../../types.js'

// allow: selector factory depends on lodash memoize identity semantics
const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const EMPTY_ARRAY: Tx[] = []

export const createActiveAssetIncomingTxSelectorDefinition = {
  id: 'createActiveAssetIncomingTxSelector',
  selectorFactory: (
    createActiveAssetSourceSelector: (assetName: string) => (state: object) => TxSet | undefined
  ): ((assetName: string) => (state: object) => Tx[]) =>
    memoize((assetName: string) => {
      return createSelector(
        createActiveAssetSourceSelector(assetName),
        (txLog: TxSet | undefined): Tx[] => {
          if (!txLog || txLog.size === 0) {
            return EMPTY_ARRAY
          }

          const txs: Tx[] = []
          for (let index = txLog.size - 1; index >= 0; index--) {
            const tx = txLog.getAt(index)
            if (!tx) continue

            if (tx.pending && !tx.sent && !tx.failed) {
              txs.push(tx)
            }
          }

          return txs.length > 0 ? txs : EMPTY_ARRAY
        }
      )
    }),
  dependencies: [
    //
    { selector: 'createActiveAssetSourceSelector' },
  ],
} as const satisfies SelectorDefinition
