import type { RelativePath } from './types.js'

const dummyBasePath = 'https://example.com'

export const asRelativePath = (maybeRelativePath: string): RelativePath => {
  const base = new URL(dummyBasePath)

  const candidate = new URL(maybeRelativePath, base)

  if (candidate.origin !== base.origin) {
    throw new Error('Changing origin is not allowed')
  }

  return candidate.pathname as RelativePath
}
