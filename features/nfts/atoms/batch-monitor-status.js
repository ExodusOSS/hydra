import { createStorageAtomFactory, dedupe } from '@exodus/atoms'

const createNftBatchMonitorStatusAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return dedupe(
    atomFactory({
      key: 'nftBatchMonitorStatus',
      defaultValue: {},
      isSoleWriter: true,
    })
  )
}

export default createNftBatchMonitorStatusAtom
