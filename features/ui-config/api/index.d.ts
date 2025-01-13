import type { Atom } from '@exodus/atoms'

type UiConfigAtom = Pick<Atom<any>, 'set' | 'get'>

declare const uiConfigDefinition: {
  id: 'uiConfig'
  type: 'api'
  factory(): {
    uiConfig: UiConfigAtomRecord<string, UiConfigAtom>
  }
}

export default uiConfigDefinition
