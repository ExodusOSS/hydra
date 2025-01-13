import seedSignerDefinition from '../seed-signer.js'
import keychainDefinition from '@exodus/keychain/module'
import { WalletAccount } from '@exodus/models'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id'
import { SEED_SRC } from '@exodus/models/lib/wallet-account'
import { mnemonicToSeedSync } from 'bip39'

const SEED = mnemonicToSeedSync(
  'menu memory fury language physical wonder dog valid smart edge decrease worth'
)
const seedId = getSeedId(SEED)

const assets = {
  ethereum: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: () => ({
        derivationAlgorithm: 'BIP32',
        derivationPath: 'm/44/0',
        keyType: 'secp256k1',
      }),
      signMessage: jest.fn(),
    },
    get baseAsset() {
      return assets.ethereum
    },
  },
}

const assetsModule = {
  getAsset: (assetName: keyof typeof assets) => assets[assetName],
}

const setup = () => {
  const keychain = keychainDefinition.factory({
    logger: console,
  })

  keychain.addSeed(SEED)
  const seedSigner = seedSignerDefinition.factory({
    assetsModule: assetsModule as never,
    keychain,
    addressProvider: {
      getSupportedPurposes: async () => [44],
    },
  })

  return {
    seedSigner,
  }
}

describe('SeedBasedMessageSigner', () => {
  it('sign a message with the default address', async () => {
    const { seedSigner } = setup()
    const walletAccount = new WalletAccount({ index: 1, source: SEED_SRC, seedId })
    const expectedResult = Buffer.alloc(32)
    assets.ethereum.api.signMessage.mockResolvedValueOnce(expectedResult)
    const signedMessage = await seedSigner.signMessage({
      baseAssetName: 'ethereum',
      walletAccount,
      message: {
        rawMessage: Buffer.from('hello world', 'utf8'),
      },
    })
    expect(assets.ethereum.api.signMessage).toHaveBeenCalled()
    expect(signedMessage).toBe(expectedResult)
  })
})
