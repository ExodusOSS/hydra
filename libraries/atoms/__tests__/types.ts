/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Atom } from '../src/index.js'
import { createInMemoryAtom, filter } from '../src/index.js'

const maybeStringAtom = createInMemoryAtom<string | undefined>({ defaultValue: undefined })

// @ts-expect-error This should fail
let stringAtom: Atom<string> = maybeStringAtom

// @ts-expect-error This should fail, not using a type guard
stringAtom = filter(maybeStringAtom, Boolean)

// This should pass
stringAtom = filter(maybeStringAtom, (value) => value !== undefined)
