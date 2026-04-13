import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import type { WalletAccountMap } from '../../types.js'
import createEnabledWalletAccountsAtom from '../enabled-wallet-accounts.js'

describe('createEnabledWalletAccountsAtom', () => {
  const walletAccountsAtom = createInMemoryAtom<WalletAccountMap>()

  it('should return enabled wallet accounts', async () => {
    const enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({
      walletAccountsAtom,
    })

    const subscriber = jest.fn()
    enabledWalletAccountsAtom.observe(subscriber)

    const enabled: WalletAccountMap = {
      exodus_0: WalletAccount.defaultWith({ enabled: true }),
      exodus_2: WalletAccount.defaultWith({ enabled: true, index: 2 }),
    }
    const all: WalletAccountMap = {
      ...enabled,
      exodus_1: WalletAccount.defaultWith({ enabled: false, index: 1 }),
    }

    await walletAccountsAtom.set(all)

    expect(subscriber).toHaveBeenCalledWith(enabled)
    expect(await enabledWalletAccountsAtom.get()).toEqual(enabled)
  })
})
