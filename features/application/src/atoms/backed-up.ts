import { createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'

type Params = {
  storage: Storage<boolean>
}

const createBackedUpAtom = ({ storage }: Params) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({ key: 'backedUp', defaultValue: false })
}

export default createBackedUpAtom
