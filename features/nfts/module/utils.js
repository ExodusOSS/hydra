import { pick } from '@exodus/basic-utils'

import { FUSION_SCHEMA } from './constants.js'

export const getConfigBySchema = (nftConfig) => {
  if (typeof nftConfig?.id !== 'string') {
    return null
  }

  const { id, ...attributes } = nftConfig
  return { [id]: pick(attributes, FUSION_SCHEMA) }
}
