import { AccountStates } from '../../test-utils.js'
import updateAccountStateReducer from '../../../batching/reducer/update-account-state.js'

const TestAccountState = AccountStates.bitcoin

describe('updateAccountStateReducer', () => {
  it('should merge data of previous changes', () => {
    const changes = {
      accountStates: {
        exodus_0: {
          bitcoin: TestAccountState.create({ cursor: 'the cursor' }),
        },
      },
    }

    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
      newData: {
        balance: '3 BTC',
      },
    }

    const result = updateAccountStateReducer(
      changes,
      { payload },
      {
        getCachedAccountState: () => TestAccountState.create(),
      }
    )

    expect(result.accountStates.exodus_0.bitcoin.toJSON()).toEqual({
      t: 'object',
      v: {
        _version: 1,
        balance: '3 BTC',
        cursor: 'the cursor',
      },
    })
  })
})
