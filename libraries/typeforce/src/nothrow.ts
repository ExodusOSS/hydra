import typeforce from './index.js'

interface TfNoThrow {
  (type: unknown, value: unknown, strict?: boolean): boolean
  error?: unknown
}

const tfNoThrow: TfNoThrow & typeof typeforce = Object.assign(function tfNoThrow(
  type: unknown,
  value: unknown,
  strict?: boolean
): boolean {
  try {
    return typeforce(type, value, strict)
  } catch (e) {
    ;(tfNoThrow as TfNoThrow).error = e
    return false
  }
}, typeforce) as TfNoThrow & typeof typeforce

export default tfNoThrow
