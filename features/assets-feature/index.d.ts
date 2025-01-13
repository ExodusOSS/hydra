import type assetsApiDefinition from './api/index.js'

declare const assets: () => {
  id: 'assets'
  definitions: [{ definition: typeof assetsApiDefinition }]
}

export default assets
