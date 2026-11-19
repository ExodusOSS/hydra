import lodash from 'lodash'

import removeAccountStateReducer from '../../../batching/reducer/remove-account-state.js'
import {
  AccountStates,
  createAction,
  createEmptyChanges,
  createReducerContext,
} from '../../test-utils.js'

const { has } = lodash

const TestAccountState = AccountStates.bitcoin

describe('removeAccountStateReducer', () => {
  it('should unset changes if cached state is empty state', () => {
    const changes = {
      ...createEmptyChanges(),
      accountStates: {
        exodus_0: {
          bitcoin: TestAccountState.create(),
        },
      },
    }
    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
    }

    const result = removeAccountStateReducer(
      changes,
      createAction(payload),
      createReducerContext({
        getCachedAccountState: () => TestAccountState.create(),
      })
    )

    expect(has(result, ['accountStates', 'exodus_0', 'bitcoin'])).toBe(false)
  })
})
