import type { AssetSources } from '../module/asset-sources.js'
import type { Definition } from '@exodus/dependency-types'

type Dependencies = {
  assetSources: AssetSources
}

const createAssetSourcesApi = ({ assetSources }: Dependencies) =>
  ({
    assetSources: {
      getSupportedPurposes: assetSources.getSupportedPurposes,
      getDefaultPurpose: assetSources.getDefaultPurpose,
      isSupported: assetSources.isSupported,
    },
  }) as const

const assetSourcesApiDefinition = {
  id: 'assetSourcesApi',
  type: 'api',
  factory: createAssetSourcesApi,
  dependencies: ['assetSources'],
} as const satisfies Definition

export default assetSourcesApiDefinition
