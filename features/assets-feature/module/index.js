import AssetsModule from './assets-module.js'

const createAssetsModule = (props) => new AssetsModule(props)

const assetsModuleDefinition = {
  id: 'assetsModule',
  type: 'module',
  factory: createAssetsModule,
  dependencies: [
    'assetsAtom',
    'storage?',
    'iconsStorage?',
    'assetPlugins',
    'combinedAssetsList?',
    'validateCustomToken?',
    'config?',
    'fetch',
    'logger',
  ],
  public: true,
}

export default assetsModuleDefinition
