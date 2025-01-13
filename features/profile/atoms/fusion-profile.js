import { createFusionAtom } from '@exodus/fusion-atoms'

const createFusionProfileAtom = ({ fusion, logger }) => {
  return createFusionAtom({ fusion, path: 'profile', logger })
}

export default createFusionProfileAtom
