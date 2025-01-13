import { createInMemoryAtom } from '@exodus/atoms'

const createLockedAtom = () => createInMemoryAtom({ defaultValue: true })

export default createLockedAtom
