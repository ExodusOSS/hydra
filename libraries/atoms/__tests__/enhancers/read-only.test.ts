import readOnly from '../../src/enhancers/read-only.js'
import type { Atom } from '../../src/index.js'
import { createInMemoryAtom } from '../../src/index.js'

describe('readOnly enhancer', () => {
  const atom = createInMemoryAtom<string>({ defaultValue: 'the batman' })
  const readOnlyAtom = readOnly(atom)
  test('atom is readOnly', async () => {
    await expect((readOnlyAtom as Atom<string>).set('untouchable')).rejects.toThrow(
      'selected atom does not support set'
    )
  })
  test('atom still support get', async () => {
    await expect(readOnlyAtom.get()).resolves.toEqual('the batman')
  })
  test('atom still support observe', async () => {
    expect(await new Promise(readOnlyAtom.observe)).toEqual('the batman')
  })
})
