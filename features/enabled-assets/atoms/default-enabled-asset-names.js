import { createInMemoryAtom } from '@exodus/atoms'

export const createDefaultEnabledAssetNamesAtom = () => {
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  return createInMemoryAtom()
}
