// Currently supports only simple data structures and is intended solely for cloning balances.
// Make sure to add tests if you plan to use it for anything else.
const cloneDeepWith = (input, handler) => {
  const cloned = handler(input)

  if (cloned !== undefined) {
    return cloned
  }

  if (input instanceof Map) {
    throw new TypeError('Cloning Map objects is not supported')
  }

  if (input instanceof Set) {
    throw new TypeError('Cloning Set objects is not supported')
  }

  if (input instanceof Date) {
    throw new TypeError('Cloning Date objects is not supported')
  }

  if (Array.isArray(input)) {
    return input.map((item) => cloneDeepWith(item, handler))
  }

  if (typeof input === 'object' && input !== null) {
    const cloned = Object.create(Object.getPrototypeOf(input))
    for (const key in input) {
      cloned[key] = cloneDeepWith(input[key], handler)
    }

    return cloned
  }

  return input
}

export default cloneDeepWith
