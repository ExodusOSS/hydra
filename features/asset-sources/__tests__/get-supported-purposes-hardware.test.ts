import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import assetSourcesDefinition from '../module/index.js'

const { factory: createAssetSources } = assetSourcesDefinition

describe('assetSources.getSupportedPurposes for hardware wallet accounts', () => {
  const bitcoin = {
    name: 'bitcoin',
    baseAssetName: 'bitcoin',
    isCombined: false,
    api: {
      getSupportedPurposes: () => [84, 44],
    },
    get baseAsset() {
      return bitcoin
    },
  }

  const walletAccounts = {
    exodus_0: new WalletAccount({ source: 'exodus', index: 0 }),
    ledger_0_abc: new WalletAccount({ source: 'ledger', index: 0, id: 'abc' }),
  }

  const createDeps = ({ connectedAssetNamesByWalletAccount }: any = {}) => ({
    assetsAtom: createInMemoryAtom({ defaultValue: { value: { bitcoin } } }),
    walletAccountsAtom: createInMemoryAtom({ defaultValue: walletAccounts }),
    availableAssetNamesByWalletAccountAtom: createInMemoryAtom({
      defaultValue: {
        exodus_0: ['bitcoin'],
        ledger_0_abc: ['bitcoin'],
      },
    }),
    hardwareWalletConnectedAssetNamesAtom:
      connectedAssetNamesByWalletAccount === undefined
        ? undefined
        : createInMemoryAtom({ defaultValue: connectedAssetNamesByWalletAccount }),
  })

  it('returns purposes when the asset is connected', async () => {
    const assetSources = createAssetSources(
      createDeps({ connectedAssetNamesByWalletAccount: { ledger_0_abc: ['bitcoin'] } })
    )

    await expect(
      assetSources.getSupportedPurposes({ walletAccount: 'ledger_0_abc', assetName: 'bitcoin' })
    ).resolves.toEqual([84, 44])
  })

  it('returns no purposes when the asset is not connected', async () => {
    const assetSources = createAssetSources(
      createDeps({ connectedAssetNamesByWalletAccount: { ledger_0_abc: [] } })
    )

    await expect(
      assetSources.getSupportedPurposes({ walletAccount: 'ledger_0_abc', assetName: 'bitcoin' })
    ).resolves.toEqual([])
  })

  it('returns no purposes when the wallet account has no connected assets entry', async () => {
    const assetSources = createAssetSources(createDeps({ connectedAssetNamesByWalletAccount: {} }))

    await expect(
      assetSources.getSupportedPurposes({ walletAccount: 'ledger_0_abc', assetName: 'bitcoin' })
    ).resolves.toEqual([])
  })

  it('does not affect software wallet accounts', async () => {
    const assetSources = createAssetSources(
      createDeps({ connectedAssetNamesByWalletAccount: { ledger_0_abc: [] } })
    )

    await expect(
      assetSources.getSupportedPurposes({ walletAccount: 'exodus_0', assetName: 'bitcoin' })
    ).resolves.toEqual([84, 44])
  })

  it('preserves current behavior when the atom is not provided', async () => {
    const assetSources = createAssetSources(createDeps())

    await expect(
      assetSources.getSupportedPurposes({ walletAccount: 'ledger_0_abc', assetName: 'bitcoin' })
    ).resolves.toEqual([84, 44])
  })

  it('getDefaultPurpose throws for a disconnected hardware asset', async () => {
    const assetSources = createAssetSources(
      createDeps({ connectedAssetNamesByWalletAccount: { ledger_0_abc: [] } })
    )

    await expect(
      assetSources.getDefaultPurpose({ walletAccount: 'ledger_0_abc', assetName: 'bitcoin' })
    ).rejects.toThrow(/not supported/u)
  })
})
