import { createInMemoryAtom } from '@exodus/atoms'

// eslint-disable-next-line @exodus/hydra/in-memory-atom-default-value
const createBalancesAtom = () => createInMemoryAtom()

export default createBalancesAtom
