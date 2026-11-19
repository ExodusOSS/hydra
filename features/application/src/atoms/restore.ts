import { createInMemoryAtom } from '@exodus/atoms'

const createRestoreAtom = () => createInMemoryAtom() // oxlint-disable-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value

export default createRestoreAtom
