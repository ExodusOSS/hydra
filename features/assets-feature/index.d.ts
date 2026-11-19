import type assetsApiDefinition from './api/index.js'

export type { AssetsModule } from './module/assets-module.js'
export { TokenStatus } from './api/index.js'

export type RuntimeConfigFlags = Record<string, Record<string, string>>

export type AssetsConfig = {
  multiAddressMode?: { defaults?: Record<string, boolean> }
  disabledPurposes?: { defaults?: Record<string, number[]> }
  compatibilityModeGapLimits?: Record<string, number>
  compatibilityModeMultiAddressMode?: Record<string, boolean>
  runtimeConfigFlags?: RuntimeConfigFlags
  searchBasedAssetLoaderPlugin?: unknown
  assetsModule?: Record<string, unknown>
}

declare const assets: (config?: AssetsConfig) => {
  id: 'assets'
  definitions: [{ definition: typeof assetsApiDefinition }]
}

export default assets
