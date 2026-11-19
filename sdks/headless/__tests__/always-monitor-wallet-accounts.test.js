import { waitUntil } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('alwaysMonitorWalletAccounts config', () => {
  let exodus
  let baseAssetNamesToMonitorAtom
  let enabledAssetsAtom

  const passphrase = 'my-password-manager-generated-this'

  const waitForMonitored = (predicate) =>
    waitUntil({ atom: baseAssetNamesToMonitorAtom, predicate, rejectAfter: 2000 })

  beforeEach(async () => {
    const container = createExodus({
      adapters: createAdapters(),
      config: {
        ...config,
        availableAssets: {
          ...config.availableAssets,
          defaultAvailableAssetNames: ['bitcoin', 'ethereum', 'solana'],
        },
        assetSources: { allowedBaseAssetNamesByWalletAccount: { exodus_1: ['solana'] } },
        alwaysMonitorWalletAccounts: ['exodus_1'],
      },
    })
    exodus = container.resolve()
    ;({ baseAssetNamesToMonitorAtom, enabledAssetsAtom } = container.getByType('atom'))

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await waitForMonitored((networks) => networks.includes('bitcoin'))
  })

  afterEach(() => exodus.application.stop())

  test('monitors a listed wallet account’s networks without enabling them, once it exists', async () => {
    await expect(baseAssetNamesToMonitorAtom.get()).resolves.not.toContain('solana')

    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })

    await waitForMonitored((networks) => networks.includes('solana'))
    await expect(enabledAssetsAtom.get()).resolves.not.toHaveProperty('solana')
  })

  test('stops monitoring them once the wallet account is disabled', async () => {
    await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })
    await waitForMonitored((networks) => networks.includes('solana'))

    await exodus.walletAccounts.disable('exodus_1')

    await waitForMonitored((networks) => !networks.includes('solana'))
  })
})
