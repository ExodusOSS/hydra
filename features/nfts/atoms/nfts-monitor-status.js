import { createStorageAtomFactory } from '@exodus/atoms'

const createNftsMonitorStatusAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'nftsMonitorStatus',
    defaultValue: Object.create(null),
  })
}

export default createNftsMonitorStatusAtom
