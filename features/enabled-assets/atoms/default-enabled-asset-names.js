import { createInMemoryAtom } from '@exodus/atoms'

export const createDefaultEnabledAssetNamesAtom = () => {
  // eslint-disable-next-line @exodus/hydra/in-memory-atom-default-value
  return createInMemoryAtom()
}
