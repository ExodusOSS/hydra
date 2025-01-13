import { createInMemoryAtom } from '@exodus/atoms'

const createRestoreAtom = () => createInMemoryAtom() // eslint-disable-line @exodus/hydra/in-memory-atom-default-value

export default createRestoreAtom
