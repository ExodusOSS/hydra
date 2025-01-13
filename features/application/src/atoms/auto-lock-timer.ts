import { createStorageAtomFactory } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import ms from 'ms'

type Params = {
  storage: Storage<number>
}

const createAutoLockTimerAtom = ({ storage }: Params) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'autoLockTimer',
    defaultValue: ms('60m'),
  })
}

export default createAutoLockTimerAtom
