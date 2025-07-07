import type { Atom } from '@exodus/atoms'

interface ErrorsSchema {
  errors: { namespace: string; error: Error; context: any; time: number }[]
}

export type ErrorsAtom = Atom<ErrorsSchema>

declare const errorsAtomDefinition: {
  id: 'errorsAtom'
  type: 'atom'
  factory(): ErrorsAtom
}

export default errorsAtomDefinition
