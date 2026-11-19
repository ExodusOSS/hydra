import { validate as _validate } from './validate.mjs'
import { cleanup as _cleanup } from './cleanup.mjs'

export function validate(svg) {
  return _validate({ svg })
}

export function cleanup(svg) {
  return _cleanup({ svg })
}

export function validateTrusted(svg) {
  return _validate({ svg, isTrusted: true })
}

export function cleanupTrusted(svg) {
  return _cleanup({ svg, isTrusted: true })
}
