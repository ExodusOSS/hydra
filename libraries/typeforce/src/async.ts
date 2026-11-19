import typeforce from './index.js'

type AsyncCallback = (err?: unknown) => void

function tfAsync(
  type: unknown,
  value: unknown,
  strict: boolean | AsyncCallback,
  callback?: AsyncCallback
): void {
  if (typeof strict === 'function') return tfAsync(type, value, false, strict)

  try {
    typeforce(type, value, strict as boolean)
  } catch (e) {
    return callback!(e)
  }

  callback!()
}

export default Object.assign(tfAsync, typeforce) as typeof tfAsync & typeof typeforce
