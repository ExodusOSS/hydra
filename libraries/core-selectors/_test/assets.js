import { connectAssetsList } from '@exodus/assets'
import combinedAssetsList from '@exodus/combined-assets-meta'
import assetsBase from '@exodus/assets-base'

const assets = connectAssetsList([...combinedAssetsList, ...Object.values(assetsBase)])

export default assets
