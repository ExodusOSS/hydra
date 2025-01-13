import { Buffer } from 'buffer'
import { File } from './file'
import { FormDataLike } from '@exodus/networking-common'

type EntryValue = string | File
type Entry = [string, EntryValue]

export default class FormData implements FormDataLike<File | Buffer, File> {
  private data: Entry[] = []

  append(name: string, value: string | File | Buffer, filename?: string) {
    this.data.push(normalizeArgs(name, value, filename))
  }

  delete(name: string) {
    this.data = this.data.filter((entry) => entry[0] !== name)
  }

  get(name: string) {
    return this.data.find((entry) => entry[0] === name)?.[1] ?? null
  }

  getAll(name: string) {
    return this.data.filter((entry) => entry[0] === name).map((entry) => entry[1])
  }

  has(name: string): boolean {
    const entries = this.entries()
    for (const entry of entries) {
      if (entry[0] === name) {
        return true
      }
    }

    return false
  }

  set(name: string, value: string | Buffer | File, filename?: string) {
    const newEntry = normalizeArgs(name, value, filename)

    const index = this.data.findIndex((entry) => entry[0] === name)

    const filtered = this.data.filter((entry) => entry[0] !== name)
    const insertAt = index === -1 ? filtered.length : index

    this.data = filtered
    this.data.splice(insertAt, 0, newEntry)
  }

  *keys() {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i][0]
    }
  }

  *values() {
    for (const [, value] of this) {
      yield value
    }
  }

  *entries() {
    for (let i = 0; i < this.data.length; i++) {
      yield this.data[i]
    }
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  get [Symbol.toStringTag]() {
    return 'FormData'
  }
}

function normalizeArgs(
  name: string,
  value: string | Buffer | File,
  filename?: string
): [string, File | string] {
  if (value instanceof Buffer) {
    return [name, new File(value, filename ?? 'blob')]
  }

  if (value instanceof File && filename && filename !== value.name) {
    return [name, new File(value.buffer, filename)]
  }

  return [name, value]
}
