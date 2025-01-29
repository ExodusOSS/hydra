import assert from 'minimalistic-assert'

export function assertNonNullable<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(message)
  }
}

export function assertDefined<T>(
  value: T,
  message: string
): asserts value is Exclude<T, undefined> {
  if (value === undefined) {
    throw new Error(message)
  }
}

export function assertValidIdentifier(identifier: string) {
  if (identifier.includes('!')) {
    throw new Error(`Identifier must not include an exclamation mark (!). Received ${identifier}`)
  }
}

export function assertValidFilesystemKey(hashedKey: string | undefined) {
  assert(typeof hashedKey === 'string', 'hashString result was not of type string')
  const safePathRegex = /^[\w-=]*$/ // eslint-disable-line regexp/require-unicode-regexp
  assert(safePathRegex.test(hashedKey), 'hashString result included forbidden characters')
}
