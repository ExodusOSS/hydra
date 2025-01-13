import { AccountStates } from '../../test-utils.js'
import removeAccountStateReducer from '../../../batching/reducer/remove-account-state.js'
import lodash from 'lodash'

const { has } = lodash

const TestAccountState = AccountStates.bitcoin

describe('removeAccountStateReducer', () => {
  const getAsset = () => ({ api: { createAccountState: () => TestAccountState } })

  it('should unset changes if cached state is empty state', () => {
    const changes = {
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
      { payload },
      {
        getAsset,
        getCachedAccountState: () => TestAccountState.create(),
      }
    )

    expect(has(result, ['accountStates', 'exodus_0', 'bitcoin'])).toBe(false)
  })
})
