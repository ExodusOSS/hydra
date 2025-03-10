import { connectAssetsList } from '@exodus/assets'
import combinedAssetsList from '@exodus/combined-assets-meta'
// this is a dev dependency
// eslint-disable-next-line import/no-extraneous-dependencies
import assetsBase from '@exodus/assets-base'

const assets = connectAssetsList([...combinedAssetsList, ...Object.values(assetsBase)])

export default assets
