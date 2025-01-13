import delay from 'delay'
import ms from 'ms'

function toObject(err) {
  return err instanceof Error
    ? { name: err.name, message: err.message, stack: err.stack, ...err }
    : err
}

// Return function with same signature as the wrapped function `fun`. The new function will attempt retries at the supplied delays.
// Allows prematurely ending retries if a final error is thrown. The final error is indicated by a `finalError` porperty.
// Collects retry errors and places them in the `errorChain` property of the final exception for logging purposes.
export function retry(fun, { delayTimesMs = [ms('10s')] }) {
  return async function (...args) {
    const delays = delayTimesMs.map((d) => (typeof d === 'number' ? d : ms(d)))
    const errorChain = []

    let i = 0
    while (true) {
      try {
        return await fun(...args)
      } catch (err) {
        const e = err || new Error('Null error')

        if (e.finalError) {
          e.errorChain = errorChain
          throw e
        }

        if (i === delays.length) {
          e.errorChain = errorChain
          throw e
        }

        errorChain.push(toObject(e))

        await delay(delays[i])
        i++
      }
    }
  }
}
