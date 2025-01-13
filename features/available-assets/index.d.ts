import type availableAssetsApiDefinition from './api/index.js'

declare const availableAssets: () => {
  id: 'availableAssets'
  definitions: [{ definition: typeof availableAssetsApiDefinition }]
}

export default availableAssets
