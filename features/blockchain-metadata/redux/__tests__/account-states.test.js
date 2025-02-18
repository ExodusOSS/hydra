import { Address, UtxoCollection, WalletAccount } from '@exodus/models'

import reduxModule from '../account-states/index.js'
import { assets, setup } from './utils.js'

const { id } = reduxModule
const walletAccount0 = WalletAccount.DEFAULT
const walletAccount1 = new WalletAccount({ source: 'exodus', index: 1 })

const BtcAccountState = assets.bitcoin.api.createAccountState()
const defaultBtcAccountState = BtcAccountState.create()
const customBtcAccountState = BtcAccountState.create({
  utxos: UtxoCollection.fromArray(
    [
      {
        address: Address.fromJSON({
          address: 'blah',
        }),
        value: '1 BTC',
      },
    ],
    {
      currency: assets.bitcoin.currency,
    }
  ),
})

describe(`${id} selectors`, () => {
  it(`should return ${id}`, () => {
    const { store, selectors, emitActiveWalletAccount, emitAccountStates } = setup({ reduxModule })

    const isLoaded = (walletAccount) =>
      selectors.accountStates.createIsWalletAccountLoadedSelector(walletAccount.toString())(
        store.getState()
      )

    const isActiveWalletAccountLoaded = () =>
      selectors.accountStates.isActiveWalletAccountLoaded(store.getState())

    const get1stBitcoinAccountState = selectors.accountStates.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount0.toString(),
    })

    const get2ndBitcoinAccountState = selectors.accountStates.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount1.toString(),
    })

    emitActiveWalletAccount(walletAccount1.toString())

    expect(isLoaded(walletAccount0)).toEqual(false)
    expect(isLoaded(walletAccount1)).toEqual(false)
    expect(get1stBitcoinAccountState(store.getState())).toEqual(defaultBtcAccountState)
    expect(get2ndBitcoinAccountState(store.getState())).toEqual(defaultBtcAccountState)

    emitAccountStates({
      value: {
        [walletAccount0.toString()]: {
          bitcoin: defaultBtcAccountState,
        },
        [walletAccount1.toString()]: {
          bitcoin: customBtcAccountState,
        },
      },
    })

    expect(isLoaded(walletAccount0)).toEqual(true)
    expect(isLoaded(walletAccount1)).toEqual(true)
    expect(isActiveWalletAccountLoaded()).toEqual(true)
    expect(get1stBitcoinAccountState(store.getState()).equals(defaultBtcAccountState)).toEqual(true)
    expect(get2ndBitcoinAccountState(store.getState()).equals(customBtcAccountState)).toEqual(true)

    emitAccountStates({
      changes: {
        [walletAccount1.toString()]: {
          bitcoin: defaultBtcAccountState,
        },
      },
    })

    expect(get2ndBitcoinAccountState(store.getState()).equals(defaultBtcAccountState)).toEqual(true)
  })

  it(`should fall back to default accountStates`, () => {
    const { store, selectors, emitAccountStates } = setup({ reduxModule })

    const get1stBitcoinAccountState = selectors.accountStates.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount0.toString(),
    })

    const get2ndBitcoinAccountState = selectors.accountStates.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount1.toString(),
    })

    expect(get1stBitcoinAccountState(store.getState())).toEqual(defaultBtcAccountState)
    expect(get2ndBitcoinAccountState(store.getState())).toEqual(defaultBtcAccountState)

    emitAccountStates({
      value: {
        [walletAccount0.toString()]: {
          bitcoin: customBtcAccountState,
        },
      },
    })

    expect(get1stBitcoinAccountState(store.getState())).toEqual(customBtcAccountState)
    expect(get2ndBitcoinAccountState(store.getState())).toEqual(defaultBtcAccountState)
  })
})
