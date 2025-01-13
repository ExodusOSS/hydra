import pRetry from 'p-retry'

// execute

const noop = () => {}

// wrap
export const wrap =
  (fn, { onFailedAttempt = noop, ...retryOpts } = {}) =>
  (...args) =>
    pRetry(async () => {
      try {
        return await fn(...args)
      } catch (err) {
        try {
          await onFailedAttempt(err)
        } catch (err2) {
          throw new pRetry.AbortError(err2)
        }

        throw err
      }
    }, retryOpts)

export { default as retry } from 'p-retry'
