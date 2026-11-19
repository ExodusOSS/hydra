import { createInMemoryAtom } from '@exodus/atoms'

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
const createAvailableAssetAtom = () => createInMemoryAtom()

export default createAvailableAssetAtom
