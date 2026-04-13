import { combine } from '@exodus/atoms'
import createContainer from '@exodus/dependency-injection'
import { WalletAccount } from '@exodus/models'
import type { Storage } from '@exodus/storage-interface'
import createInMemoryStorage from '@exodus/storage-memory'

import {
  enabledWalletAccountsAtomDefinition,
  walletAccountsAtomDefinition,
  walletAccountsInternalAtomDefinition,
} from '../index.js'
import createWalletAccountsInternalAtom, {
  type SerializedWalletAccounts,
} from '../wallet-accounts-internal.js'

describe('createWalletAccountsInternalAtom', () => {
  let storage: Storage<SerializedWalletAccounts>
  beforeEach(() => {
    storage = createInMemoryStorage<SerializedWalletAccounts>()
  })

  it('should serialize wallet accounts to storage', async () => {
    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, label: 'Wayne Portfolio' })

    await walletAccountsAtom.set({ exodus_0: walletAccount })

    await expect(storage.get('walletAccounts')).resolves.toEqual({
      exodus_0: walletAccount.toJSON(),
    })
  })

  it('should sort normal wallet accounts before hardware wallet accounts', async () => {
    const walletAccount = new WalletAccount({
      ...WalletAccount.DEFAULT,
      label: 'Normal Portfolio',
      index: 0,
    })

    const hardwareWalletAccount = new WalletAccount({
      ...WalletAccount.DEFAULT,
      label: 'Wayne Portfolio',
      source: 'ledger',
      id: 'someid',
      index: 0,
    })

    await storage.set('walletAccounts', {
      ledger_0_someid: hardwareWalletAccount.toJSON(),
      exodus_0: walletAccount.toJSON(),
    })

    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    expect(Object.keys((await walletAccountsAtom.get())!)).toEqual(['exodus_0', 'ledger_0_someid'])
  })

  it('should deserialize wallet accounts from storage', async () => {
    const walletAccount = new WalletAccount({
      ...WalletAccount.DEFAULT,
      label: 'Wayne Portfolio',
      index: 42,
    })
    await storage.set('walletAccounts', { exodus_42: walletAccount.toJSON() })

    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    await expect(walletAccountsAtom.get()).resolves.toEqual({
      exodus_42: walletAccount.toJSON(),
    })
  })

  it('clears storage when receiving an empty object', async () => {
    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    await walletAccountsAtom.set({})

    await expect(storage.get('walletAccounts')).resolves.toEqual(undefined)
  })

  it('clears storage when receiving undefined', async () => {
    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    await walletAccountsAtom.set(undefined)

    await expect(storage.get('walletAccounts')).resolves.toEqual(undefined)
  })

  it('clears storage when receiving null', async () => {
    const walletAccountsAtom = createWalletAccountsInternalAtom({ storage })

    await walletAccountsAtom.set(undefined)

    await expect(storage.get('walletAccounts')).resolves.toEqual(undefined)
  })
})

describe('dependency injection', () => {
  test('dependencies are properly declared', async () => {
    const container = createContainer({ logger: console }).registerMultiple([
      {
        id: 'storage',
        factory: createInMemoryStorage,
        public: true,
      },
      {
        id: 'config',
        factory: () => ({}),
        public: true,
      },
      walletAccountsAtomDefinition,
      walletAccountsInternalAtomDefinition,
      enabledWalletAccountsAtomDefinition,
    ])
    container.resolve()
    const { walletAccountsInternalAtom, enabledWalletAccountsAtom } = container.getAll()
    await walletAccountsInternalAtom.set({
      [WalletAccount.DEFAULT_NAME]: new WalletAccount({
        ...WalletAccount.DEFAULT,
        seedId: 'seedid',
      }),
    })
    await new Promise((resolve) =>
      combine({ walletAccountsInternalAtom, enabledWalletAccountsAtom }).observe(resolve)
    )
  })
})
