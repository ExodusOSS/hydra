import preprocess from '../src/index.js'
import order from '../src/preprocessors/order.js'

describe('order', () => {
  const createNode = (id, { before } = {}) => {
    return {
      definition: {
        id,
        factory: () => {},
        dependencies: [],
      },
      ...(before && {
        order: {
          before,
        },
      }),
    }
  }

  const isBefore = (definitions, id, before) => {
    const index = definitions.findIndex((it) => it.id === id)
    const beforeIndex = definitions.findIndex((it) => it.id === before)

    return index < beforeIndex
  }

  test('applies order', () => {
    const hogwartsAtom = createNode('hogwartsAtom')
    const potterAtom = createNode('potterAtom', { before: ['malfoyAtom'] })
    const weasleyAtom = createNode('weasleyAtom')
    const malfoyAtom = createNode('malfoyAtom')
    const grangerAtom = createNode('grangerAtom', { before: ['potterAtom'] })

    const processed = preprocess({
      preprocessors: [order()],
      dependencies: [hogwartsAtom, potterAtom, weasleyAtom, malfoyAtom, grangerAtom],
    })

    expect(isBefore(processed, 'potterAtom', 'malfoyAtom')).toBe(true)
    expect(isBefore(processed, 'grangerAtom', 'potterAtom')).toBe(true)
    expect(isBefore(processed, 'grangerAtom', 'malfoyAtom')).toBe(true)
  })

  test('applies order when node before multiple others', () => {
    const hogwartsAtom = createNode('hogwartsAtom', { before: ['malfoyAtom', 'weasleyAtom'] })
    const potterAtom = createNode('potterAtom', { before: ['malfoyAtom'] })
    const weasleyAtom = createNode('weasleyAtom', { before: ['potterAtom'] })
    const malfoyAtom = createNode('malfoyAtom')
    const grangerAtom = createNode('grangerAtom', { before: ['potterAtom', 'hogwartsAtom'] })

    const processed = preprocess({
      preprocessors: [order()],
      dependencies: [hogwartsAtom, potterAtom, weasleyAtom, malfoyAtom, grangerAtom],
    })

    expect(isBefore(processed, 'potterAtom', 'malfoyAtom')).toBe(true)
    expect(isBefore(processed, 'grangerAtom', 'potterAtom')).toBe(true)
    expect(isBefore(processed, 'grangerAtom', 'malfoyAtom')).toBe(true)
    expect(isBefore(processed, 'grangerAtom', 'hogwartsAtom')).toBe(true)
    expect(isBefore(processed, 'hogwartsAtom', 'malfoyAtom')).toBe(true)
    expect(isBefore(processed, 'hogwartsAtom', 'weasleyAtom')).toBe(true)
    expect(isBefore(processed, 'weasleyAtom', 'potterAtom')).toBe(true)
  })

  test('does not change order if not configured to', () => {
    const hogwartsAtom = createNode('hogwartsAtom')
    const potterAtom = createNode('potterAtom')
    const weasleyAtom = createNode('weasleyAtom')

    const processed = preprocess({
      preprocessors: [order()],
      dependencies: [hogwartsAtom, potterAtom, weasleyAtom],
    })

    expect(processed).toEqual([
      hogwartsAtom.definition,
      potterAtom.definition,
      weasleyAtom.definition,
    ])
  })

  test('throws for cyclic order dependency', () => {
    const hogwartsAtom = createNode('hogwartsAtom')
    const potterAtom = createNode('potterAtom', { before: ['malfoyAtom'] })
    const weasleyAtom = createNode('weasleyAtom')
    const malfoyAtom = createNode('malfoyAtom', { before: ['grangerAtom'] })
    const grangerAtom = createNode('grangerAtom', { before: ['potterAtom'] })

    expect(() =>
      preprocess({
        preprocessors: [order()],
        dependencies: [hogwartsAtom, potterAtom, weasleyAtom, malfoyAtom, grangerAtom],
      })
    ).toThrow('Order is cyclic via potterAtom <-- grangerAtom <-- malfoyAtom <-- potterAtom')
  })
})
