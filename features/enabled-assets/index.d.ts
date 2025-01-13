import type enabledAssetsApiDefinition from './api/index.js'

declare const enabledAssets: () => {
  id: 'enabledAssets'
  definitions: [{ definition: typeof enabledAssetsApiDefinition }]
}

export default enabledAssets
