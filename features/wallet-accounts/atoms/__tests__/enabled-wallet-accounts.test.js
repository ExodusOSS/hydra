import { createInMemoryAtom } from '@exodus/atoms'

import createEnabledWalletAccountsAtom from '../enabled-wallet-accounts.js'

describe('createEnabledWalletAccountsAtom', () => {
  let walletAccountsAtom
  beforeEach(() => {
    walletAccountsAtom = createInMemoryAtom()
  })

  it('should return enabled wallet accounts', async () => {
    const enabledWalletAccountsAtom = createEnabledWalletAccountsAtom({ walletAccountsAtom })

    const subscriber = jest.fn()
    enabledWalletAccountsAtom.observe(subscriber)

    const enabled = { exodus_0: { enabled: true }, exodus_2: { enabled: true } }
    const all = { ...enabled, exodus_1: { enabled: false } }

    await walletAccountsAtom.set(all)

    expect(subscriber).toHaveBeenCalledWith(enabled)
    expect(await enabledWalletAccountsAtom.get()).toEqual(enabled)
  })
})
