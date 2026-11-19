import { createFusionAtom } from '@exodus/fusion-atoms'
import type { Fusion } from '@exodus/fusion-atoms'
import type { Definition } from '@exodus/dependency-types'

type Params = {
  fusion: Fusion
}

const createShareActivityAtom = ({ fusion }: Params) =>
  createFusionAtom({
    fusion,
    path: 'shareActivity',
    defaultValue: true,
  })

const shareActivityAtomDefinition = {
  id: 'shareActivityAtom',
  type: 'atom',
  factory: createShareActivityAtom,
  dependencies: ['fusion'],
  public: true,
} as const satisfies Definition

export default shareActivityAtomDefinition
