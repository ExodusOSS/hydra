import { createFusionAtom } from '@exodus/fusion-atoms'

const shareActivityAtomDefinition = {
  id: 'shareActivityAtom',
  type: 'atom',
  factory: ({ fusion, logger }) =>
    createFusionAtom({ fusion, logger, path: 'shareActivity', defaultValue: true }),
  dependencies: ['fusion', 'logger'],
  public: true,
}

export default shareActivityAtomDefinition
