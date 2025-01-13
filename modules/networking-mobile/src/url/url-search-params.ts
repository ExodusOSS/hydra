import { URLSearchParamsLike } from '@exodus/networking-common/url'
import { parseUrlencodedString, serializeUrlencoded } from './helpers/encoding'
import { isURLSearchParamsLike } from './helpers/types'

export default class URLSearchParams implements URLSearchParamsLike {
  items: [string, string][] = []

  onChange?: () => void

  constructor(
    init: string[][] | Record<string, string> | string | URLSearchParamsLike | undefined
  ) {
    if (Array.isArray(init)) {
      if (init.some((tuple) => tuple.length !== 2)) {
        throw new TypeError(
          "Failed to construct 'URLSearchParams': parameter 1 sequence's element does not " +
            'contain exactly two elements.'
        )
      }

      this.items = init.map(([key, value]) => [key, String(value)])
      return
    }

    if (typeof init === 'object' && isURLSearchParamsLike(init)) {
      this.items = [...init.entries()]
      return
    }

    if (typeof init === 'object') {
      this.items = Object.entries(init).map(([key, value]) => [key, String(value)])
      return
    }

    if (typeof init === 'string') {
      if (init[0] === '?') {
        init = init.slice(1)
      }

      this.items = parseUrlencodedString(init)
    }
  }

  append(name: string, value: string) {
    this.items.push([name, String(value)])
    this.onChange?.()
  }

  delete(name: string) {
    this.items = this.items.filter((item) => item[0] !== name)
    this.onChange?.()
  }

  get(name: string) {
    return this.items.find((item) => item[0] === name)?.[1] ?? null
  }

  getAll(name: string) {
    return this.items.filter((item) => item[0] === name).map(([, value]) => value)
  }

  has(name: string) {
    return this.items.some((item) => item[0] === name)
  }

  set(name: string, value: string) {
    const index = this.items.findIndex((entry) => entry[0] === name)

    const filtered = this.items.filter((entry) => entry[0] !== name)
    const insertAt = index === -1 ? filtered.length : index

    this.items = filtered
    this.items.splice(insertAt, 0, [name, String(value)])
    this.onChange?.()
  }

  sort() {
    this.items.sort((a, b) => {
      if (a[0] < b[0]) {
        return -1
      }
      if (a[0] > b[0]) {
        return 1
      }
      return 0
    })
    this.onChange?.()
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  toString() {
    return serializeUrlencoded(this.items)
  }

  *entries() {
    for (const argument of this.items) {
      yield argument
    }
  }

  *keys() {
    for (const [key] of this.items) {
      yield key
    }
  }

  *values() {
    for (const [, value] of this.items) {
      yield value
    }
  }
}
