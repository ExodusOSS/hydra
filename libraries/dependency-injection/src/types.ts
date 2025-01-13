import type { Definition } from '@exodus/dependency-types'

export type Entry = Omit<Definition, 'public'> & { private: boolean }
