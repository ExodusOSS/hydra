import assetsModuleDefinition from '@exodus/assets-feature/module/index.js'
import { createInMemoryAtom } from '@exodus/atoms'
import bcash from '@exodus/bcash-plugin'
import bitcoin from '@exodus/bitcoin-plugin'
import cardano from '@exodus/cardano-plugin'
import dash from '@exodus/dash-plugin'
import decred from '@exodus/decred-plugin'
import digibyte from '@exodus/digibyte-plugin'
import dogecoin from '@exodus/dogecoin-plugin'
import ethereum from '@exodus/ethereum-plugin'
import ethereumclassic from '@exodus/ethereumclassic-plugin'
import litecoin from '@exodus/litecoin-plugin'
import ripple from '@exodus/ripple-plugin'
import stellar from '@exodus/stellar-plugin'
import createStorage from '@exodus/storage-memory'
import zcash from '@exodus/zcash-plugin'

const createIconsStorage = () => ({ storeIcons: () => {}, getIcon: () => {} })

const assetPlugins = {
  bitcoin,
  bcash,
  dash,
  dogecoin,
  decred,
  digibyte,
  litecoin,
  zcash,
  cardano,
  ethereum,
  ethereumclassic,
  stellar,
  ripple,
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
