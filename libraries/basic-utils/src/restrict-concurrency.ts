import makeConcurrent from 'make-concurrent'

type RestrictConcurrencyOptions = {
  concurrency?: number
}

type RestrictConcurrency = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult> | TResult,
  options?: RestrictConcurrencyOptions
) => (...args: TArgs) => Promise<TResult>

const restrictConcurrency = makeConcurrent as RestrictConcurrency

export default restrictConcurrency
