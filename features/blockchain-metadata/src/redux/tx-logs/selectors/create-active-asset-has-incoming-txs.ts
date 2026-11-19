// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'
import type { TxSet } from '../../../types.js'

// allow: selector factory depends on lodash memoize identity semantics
const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

export const createActiveAssetHasIncomingTxSelectorDefinition = {
  id: 'createActiveAssetHasIncomingTxSelector',
  selectorFactory: (
    createActiveAssetSourceSelector: (assetName: string) => (state: object) => TxSet | undefined
  ): ((assetName: string) => (state: object) => boolean) =>
    memoize((assetName: string) => {
      return createSelector(
        createActiveAssetSourceSelector(assetName),
        (txLog: TxSet | undefined) => {
          if (!txLog || txLog.size === 0) {
            return false
          }

          for (let index = txLog.size - 1; index >= 0; index--) {
            const tx = txLog.getAt(index)
            if (!tx) continue

            if (tx.pending && !tx.sent && !tx.failed) {
              return true
            }
          }

          return false
        }
      )
    }),
  dependencies: [
    //
    { selector: 'createActiveAssetSourceSelector' },
  ],
} as const satisfies SelectorDefinition
