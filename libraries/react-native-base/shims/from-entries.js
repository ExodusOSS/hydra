import { defineProperty } from '@exodus/basic-utils'

const fromEntries = (iterable) =>
  [...iterable].reduce((object, [key, value]) => {
    defineProperty(object, key, value)
    return object
  }, {})

export default fromEntries
