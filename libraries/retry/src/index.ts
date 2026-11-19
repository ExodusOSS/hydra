import pRetry from 'p-retry'

const noop = (): void => {}

export type OnFailedAttempt = (err: unknown) => void | Promise<void>

export type RetryOptions = { onFailedAttempt?: OnFailedAttempt } & Parameters<typeof pRetry>[1]

export const wrap =
  <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult | Promise<TResult>,
    { onFailedAttempt = noop, ...retryOpts }: RetryOptions = {}
  ) =>
  (...args: TArgs): Promise<TResult> =>
    pRetry(async () => {
      try {
        return await fn(...args)
      } catch (err) {
        try {
          await onFailedAttempt(err)
        } catch (err2) {
          throw new pRetry.AbortError(err2 as Error)
        }

        throw err
      }
    }, retryOpts)

export { default as retry } from 'p-retry'
