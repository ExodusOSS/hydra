import { createFusionAtom } from '@exodus/fusion-atoms'

const createLanguageAtom = ({ fusion }) =>
  createFusionAtom({
    fusion,
    path: 'private.language',
  })

export default createLanguageAtom
