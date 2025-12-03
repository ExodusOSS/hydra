import type KeyIdentifier from '@exodus/key-identifier'

export type CacheParams = {
  seedId: string
  keyId: KeyIdentifier
}

export const getCacheKey = ({ keyId, seedId }: CacheParams) => {
  const components = [
    seedId,
    keyId.keyType,
    keyId.derivationAlgorithm,
    keyId.derivationPath,
    keyId.assetName,
  ]

  return components
    .filter(Boolean)
    .map((component) => encodeURIComponent(component!))
    .join('/')
}
