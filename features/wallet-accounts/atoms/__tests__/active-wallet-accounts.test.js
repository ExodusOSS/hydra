import createInMemoryStorage from '@exodus/storage-memory'

import createActiveWalletAccountAtom from '../active-wallet-account.js'

describe('createActiveWalletAccountAtom', () => {
  let storage
  beforeEach(() => {
    storage = createInMemoryStorage().namespace('walletAccounts')
  })

  it('should return default wallet account if not set', async () => {
    const activeWalletAccountAtom = createActiveWalletAccountAtom({ storage })

    const activeWalletAccount = await activeWalletAccountAtom.get()

    expect(activeWalletAccount).toBe('exodus_0')
  })

  it('should return new value after changed', async () => {
    const activeWalletAccountAtom = createActiveWalletAccountAtom({ storage })

    const subscriber = jest.fn()

    activeWalletAccountAtom.observe(subscriber)

    const newValue = 'exodus_1'

    await activeWalletAccountAtom.set(newValue)

    expect(subscriber).toHaveBeenCalledWith(newValue)
    expect(await activeWalletAccountAtom.get()).toEqual(newValue)
  })
})
