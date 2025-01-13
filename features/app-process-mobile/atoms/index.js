import createAppProcessAtom from './app-process'
import { createInMemoryAtom } from '@exodus/atoms'

const appProcessAtomDefinition = {
  id: 'appProcessAtom',
  type: 'atom',
  factory: createAppProcessAtom,
  public: true,
}

const appStateHistoryAtomDefinition = {
  id: 'appStateHistoryAtom',
  type: 'atom',
  factory: () => createInMemoryAtom({ defaultValue: [] }),
  public: true,
}

export { appProcessAtomDefinition, appStateHistoryAtomDefinition }
