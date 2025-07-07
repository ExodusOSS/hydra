export const pickByArrayPaths = (obj, select) => {
  if (!Array.isArray(select)) {
    throw new TypeError(`expected Array, got ${typeof select}`)
  }

  if (obj == null) {
    return Object.create(null)
  }

  const result = Object.create(null)

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < select.length; i++) {
    const path = select[i]

    const value = getByPath(obj, path)
    if (value !== undefined) {
      setByPath(result, path, value)
    }
  }

  return result
}

const getByPath = (obj, path, defaultValue) => {
  if (typeof path === 'string') {
    return Object.hasOwn(obj, path) ? obj[path] : defaultValue
  }

  let value = obj
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    if (!Object.hasOwn(value, key)) {
      return defaultValue
    }

    value = value[key]
  }

  return value
}

const EMPTY_OBJECT = {}

const setByPath = (obj, path, value) => {
  if (typeof path === 'string') {
    if (path in EMPTY_OBJECT) {
      throw new Error('prototype pollution')
    }

    // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
    obj[path] = value
    return obj
  }

  let current = obj
  for (let i = 0; i < path.length; i++) {
    const key = path[i]

    if (key in EMPTY_OBJECT) {
      throw new Error('prototype pollution')
    }

    if (i === path.length - 1) {
      current[key] = value
      return obj
    }

    if (current[key] === undefined) {
      current[key] = Object.create(null)
    }

    current = current[key]
  }

  return obj
}
