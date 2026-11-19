import type { Storage } from '@exodus/storage-interface'
import { assertValidFilesystemKey } from './assertions.js'
import type {
  Dependencies as FactoryDependencies,
  Filesystem,
  FunctionProperties,
} from './types.js'

type StorageWithStringSet<In = unknown, Out = In> = Storage<In, Out> & {
  setString: (key: string, value: string) => Promise<void>
}

class FilesystemStorage<In, Out = In> implements StorageWithStringSet<In, Out> {
  readonly #filesystem: Filesystem
  readonly #rootDir: string
  readonly #hashString: (value: string) => string
  #whenDirectoryCreated: Promise<void>

  constructor(filesystem: Filesystem, rootDir: string, hashString: (value: string) => string) {
    this.#filesystem = filesystem
    this.#rootDir = rootDir
    this.#hashString = hashString
    this.#whenDirectoryCreated = this.#filesystem.mkdirp(rootDir)
    this.#postponeUntilDirectoryCreated('clear', 'delete', 'get', 'set', 'setString', 'batchDelete')
  }

  batchDelete = async (keys: string[]): Promise<void> => {
    await Promise.allSettled(keys.map((key) => this.#filesystem.rimraf(this.#asFilesystemKey(key))))
  }

  batchGet(): Promise<(Out | undefined)[]> {
    throw new Error('batchGet: Don\t need you right now, YAGNI et al')
  }

  batchSet(): Promise<void> {
    throw new Error('batchSet: Don\t need you right now, YAGNI et al')
  }

  clear = async (): Promise<void> => {
    await this.#filesystem.rimraf(this.#rootDir)
    this.#whenDirectoryCreated = this.#filesystem.mkdirp(this.#rootDir)
  }

  delete = async (key: string): Promise<void> => {
    return this.#filesystem.rimraf(this.#asFilesystemKey(key))
  }

  get = async (key: string): Promise<Out | undefined> => {
    try {
      return JSON.parse(await this.#filesystem.readUtf8(this.#asFilesystemKey(key)))
    } catch {
      return undefined
    }
  }

  namespace = <NamespaceIn, NamespaceOut>(prefix: string) => {
    return new FilesystemStorage<NamespaceIn, NamespaceOut>(
      this.#filesystem,
      `${this.#rootDir}/${prefix}`,
      this.#hashString
    )
  }

  set = async <T>(key: string, value: T) => {
    await this.#filesystem.writeUtf8(this.#asFilesystemKey(key), JSON.stringify(value))
  }

  setString = async (key: string, value: string) => {
    await this.#filesystem.writeUtf8(this.#asFilesystemKey(key), value)
  }

  #asFilesystemKey = (key: string) => {
    const hashedKey = this.#hashString(key)
    assertValidFilesystemKey(hashedKey)
    return `${this.#rootDir}/${hashedKey}`
  }

  #postponeUntilDirectoryCreated = (...functions: FunctionProperties<StorageWithStringSet>) => {
    functions.forEach((functionProperty) => {
      type Property = typeof functionProperty
      const originalFunction = this[functionProperty].bind(this) as (...args: never[]) => void

      this[functionProperty] = (async (
        ...args: Parameters<StorageWithStringSet[Property]>
      ): Promise<ReturnType<StorageWithStringSet[Property]>> => {
        // Read into a local before awaiting — oxlint's `no-unused-private-class-members`
        // doesn't recognize `await this.#field` as a read.
        const whenDirectoryCreated = this.#whenDirectoryCreated
        await whenDirectoryCreated
        return originalFunction(...(args as never[]))
      }) as never
    })
  }
}

const ONE_MB = 1024 * 1024
// oxlint-disable-next-line no-control-regex -- Match the complete ASCII range.
const NON_ASCII = /[^\u0000-\u007F]/

const exceedsUtf8Threshold = (payload: string, threshold: number): boolean => {
  if (payload.length > threshold) return true
  // UTF-8 uses between one and three bytes per UTF-16 code unit.
  if (payload.length * 3 <= threshold) return false
  const firstNonAscii = payload.search(NON_ASCII)
  if (firstNonAscii === -1) return false

  let bytes = payload.length
  for (let index = firstNonAscii; index < payload.length; index++) {
    const code = payload.codePointAt(index)!
    if (code <= 0x7f) continue

    if (code <= 0x7_ff) {
      bytes++
    } else {
      bytes += 2
      if (code > 0xff_ff) index++
    }

    if (bytes > threshold) return true
  }

  return false
}

type Dependencies<Value> = {
  storage: StorageWithStringSet<Value>
} & FactoryDependencies['androidFallback']

export default function withFilesystemFallback<Value>(
  dependencies: Dependencies<Value>
): Storage<Value> {
  const {
    storage,
    filesystem,
    hashString,
    rootDir,
    threshold = ONE_MB,
    placeholder = '~',
  } = dependencies

  const filesystemStorage = new FilesystemStorage<Value>(filesystem, rootDir, hashString)
  const stringifiedPlaceholder = JSON.stringify(placeholder)

  const set = async (key: string, value: Value) => {
    const stringifiedPayload = JSON.stringify(value)

    if (stringifiedPayload === stringifiedPlaceholder) {
      // The placeholder is an in-band sentinel used to mark filesystem-overflow
      // entries in the underlying async storage. Any value whose JSON form is
      // identical to the sentinel's (primitives, boxed primitives, anything that
      // round-trips to the same JSON) is indistinguishable from that marker on
      // read and would cause the get path to fall through to the filesystem and
      // return undefined — silent data loss. Reject the write at the source.
      throw new Error(
        `withFilesystemFallback: refusing to store value whose JSON form equals the sentinel placeholder for key "${key}". This sentinel is reserved internally to mark filesystem-overflow entries; storing it would be indistinguishable on read and cause silent data loss.`
      )
    }

    const payloadExceedsThreshold = exceedsUtf8Threshold(stringifiedPayload, threshold)
    if (payloadExceedsThreshold) {
      await storage.set(key, placeholder as never)
      await filesystemStorage.setString(key, stringifiedPayload)
      return
    }

    await storage.setString(key, stringifiedPayload)
  }

  const batchDelete = async (keys: string[]) => {
    await Promise.all([storage.batchDelete(keys), filesystemStorage.batchDelete(keys)])
  }

  return {
    set,
    get: async (key: string) => {
      const value = await storage.get(key)
      if (value !== (placeholder as never)) {
        return value
      }

      return filesystemStorage.get(key)
    },
    batchDelete,
    batchGet: async (keys: string[]): Promise<(Value | undefined)[]> => {
      const values = await storage.batchGet(keys)
      return Promise.all(
        keys.map(async (key, index) => {
          const value = values[index]
          if (value === (placeholder as never)) {
            return filesystemStorage.get(key)
          }

          return value
        })
      )
    },
    batchSet: async (obj: { [p: string]: Value }): Promise<void> => {
      await Promise.all(
        Object.entries(obj).map(async ([key, value]) => {
          await set(key, value)
        })
      )
    },
    clear: async (): Promise<void> => {
      await Promise.all([filesystemStorage.clear(), storage.clear()])
    },
    delete: async (key: string): Promise<void> => {
      await batchDelete([key])
    },
    namespace: <Value>(prefix: string): Storage<Value> => {
      return withFilesystemFallback<Value>({
        ...dependencies,
        rootDir: `${rootDir}/${prefix}`,
        storage: storage.namespace<Value>(prefix) as StorageWithStringSet<Value>,
      })
    },
  }
}
