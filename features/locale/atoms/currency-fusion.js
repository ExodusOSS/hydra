import { createFusionAtom } from '@exodus/fusion-atoms'

const createCurrencyFusionAtom = ({ fusion }) =>
  createFusionAtom({
    fusion,
    path: 'private.currency',
  })

export default createCurrencyFusionAtom
