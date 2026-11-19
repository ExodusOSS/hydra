import restrictConcurrency from '../restrict-concurrency.js'

const assertType = <T>(value: T): T => value

describe('restrictConcurrency', () => {
  test('has expected wrapper types', () => {
    const wrapped = restrictConcurrency(async (id: string, amount: number) => `${id}:${amount}`)

    // Type-only assertions; runtime behavior is covered by make-concurrent tests.
    assertType<(id: string, amount: number) => Promise<string>>(wrapped)
  })
})
