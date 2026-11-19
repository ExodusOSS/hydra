import { partition } from '../lodash.js'

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

const assertType = <T extends true>(_value: T): void => {
  /* type-only assertion */
}

describe('partition — type inference', () => {
  test('type-guard predicate narrows both branches when it partitions a union', () => {
    const mixed: (number | string)[] = [1, 'two', 3]
    const [nums, rest] = partition(mixed, (x): x is number => typeof x === 'number')

    assertType<Equal<typeof nums, number[]>>(true)
    // `Exclude<number | string, number>` is `string` (a proper remainder), so the
    // fail branch narrows to it.
    assertType<Equal<typeof rest, string[]>>(true)

    expect([nums, rest]).toEqual([[1, 3], ['two']])
  })

  test('type-guard narrowing to a discriminated-union member', () => {
    type Animal = { kind: 'cat'; meow: true } | { kind: 'dog'; bark: true }
    const animals: Animal[] = [
      { kind: 'cat', meow: true },
      { kind: 'dog', bark: true },
    ]
    const [cats, dogs] = partition(
      animals,
      (a): a is Extract<Animal, { kind: 'cat' }> => a.kind === 'cat'
    )

    assertType<Equal<typeof cats, { kind: 'cat'; meow: true }[]>>(true)
    assertType<Equal<typeof dogs, { kind: 'dog'; bark: true }[]>>(true)

    expect([cats, dogs]).toEqual([[{ kind: 'cat', meow: true }], [{ kind: 'dog', bark: true }]])
  })

  test('a non-partitioning guard falls back to T[] instead of collapsing to never[]', () => {
    const numbers = [1, 2, 3, 4, 5]
    const [big, small] = partition(numbers, (x): x is number => x > 3)

    // `Exclude<number, number>` is `never`; `PartitionRest` falls back to `number`
    // so `small` stays honest rather than becoming `never[]`.
    assertType<Equal<typeof big, number[]>>(true)
    assertType<Equal<typeof small, number[]>>(true)

    expect([big, small]).toEqual([
      [4, 5],
      [1, 2, 3],
    ])
  })

  test('plain boolean predicate keeps both branches at the element type', () => {
    const [pass, fail] = partition([1, 0, 1], (x) => x > 0)

    assertType<Equal<typeof pass, number[]>>(true)
    assertType<Equal<typeof fail, number[]>>(true)

    expect([pass, fail]).toEqual([[1, 1], [0]])
  })

  test('the guard overload is selected (not the boolean fallback)', () => {
    const mixed: (number | string)[] = [1, 'two']
    const [nums, rest] = partition(mixed, (x): x is number => typeof x === 'number')

    // @ts-expect-error pass branch is number[], not string[]
    const wrongPass: string[] = nums
    // @ts-expect-error fail branch is string[], not number[]
    const wrongFail: number[] = rest
    void wrongPass
    void wrongFail

    expect(nums).toEqual([1])
  })
})
