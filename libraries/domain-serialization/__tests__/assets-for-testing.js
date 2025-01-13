import assetsModuleDefinition from '@exodus/assets-feature/module'
import { createInMemoryAtom } from '@exodus/atoms'
import * as bitcoin from '@exodus/bitcoin-plugin'
import ethereum from '@exodus/ethereum-plugin'
import solana from '@exodus/solana-plugin'
import createStorage from '@exodus/storage-memory'

const createIconsStorage = () => ({ storeIcons: () => {}, getIcon: () => {} })

const assetPlugins = {
  bitcoin,
  ethereum,
  solana,
}

const createAssetsModule = assetsModuleDefinition.factory

const createAssetsForTesting = ({
  assetClientInterface = { createLogger: () => console },
} = {}) => {
  const storage = createStorage()
  const customTokensStorage = storage.namespace('customTokens')

  const iconsStorage = createIconsStorage()

  const assetsModule = createAssetsModule({
    assetPlugins,
    assetsAtom: createInMemoryAtom(),
    storage: customTokensStorage,
    iconsStorage,
  })
  assetsModule.initialize({ assetClientInterface })

  return {
    assetsModule,
    assets: assetsModule.getAssets(),
  }
}

export default createAssetsForTesting
