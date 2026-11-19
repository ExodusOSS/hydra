import { createInMemoryAtom } from '@exodus/atoms'

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
const createOptimisticFiatBalancesAtom = () => createInMemoryAtom()

export default createOptimisticFiatBalancesAtom
