import { connectAssetsList } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import combinedAssetsList from '@exodus/combined-assets-meta'

const assets = connectAssetsList([...combinedAssetsList, ...Object.values(assetsBase)])

export default assets
