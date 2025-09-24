import type { Storage } from '@exodus/storage-interface'
import { assertValidFilesystemKey } from './assertions.js'
import type { Dependencies as FactoryDependencies, Filesystem, FunctionProperties } from './types'

type StorageWithStringSet<In = unknown, Out = In> = Storage<In, Out> & {
  setString: (key: string, value: string) => Promise<void>
}

class FilesystemStorage<In, Out = In> implements StorageWithStringSet<In, Out> {
  private whenDirectoryCreated: Promise<void>

  constructor(
    private readonly filesystem: Filesystem,
    private readonly rootDir: string,
    private readonly hashString: (value: string) => string
  ) {
    this.whenDirectoryCreated = this.filesystem.mkdirp(rootDir)
    this.postponeUntilDirectoryCreated('clear', 'delete', 'get', 'set', 'setString', 'batchDelete')
  }

  batchDelete = async (keys: string[]): Promise<void> => {
    await Promise.allSettled(keys.map((key) => this.filesystem.rimraf(this.asFilesystemKey(key))))
  }

  batchGet(): Promise<(Out | undefined)[]> {
    throw new Error('batchGet: Don\t need you right now, YAGNI et al')
  }

  batchSet(): Promise<void> {
    throw new Error('batchSet: Don\t need you right now, YAGNI et al')
  }

  clear = async (): Promise<void> => {
    await this.filesystem.rimraf(this.rootDir)
    this.whenDirectoryCreated = this.filesystem.mkdirp(this.rootDir)
  }

  delete = async (key: string): Promise<void> => {
    return this.filesystem.rimraf(this.asFilesystemKey(key))
  }

  get = async (key: string): Promise<Out | undefined> => {
    try {
      return JSON.parse(await this.filesystem.readUtf8(this.asFilesystemKey(key)))
    } catch {
      return undefined
    }
  }

  namespace = <NamespaceIn, NamespaceOut>(prefix: string) => {
    return new FilesystemStorage<NamespaceIn, NamespaceOut>(
      this.filesystem,
      `${this.rootDir}/${prefix}`,
      this.hashString
    )
  }

  set = async <T>(key: string, value: T) => {
    await this.filesystem.writeUtf8(this.asFilesystemKey(key), JSON.stringify(value))
  }

  setString = async (key: string, value: string) => {
    await this.filesystem.writeUtf8(this.asFilesystemKey(key), value)
  }

  private asFilesystemKey = (key: string) => {
    const hashedKey = this.hashString(key)
    assertValidFilesystemKey(hashedKey)
    return `${this.rootDir}/${hashedKey}`
  }

  private postponeUntilDirectoryCreated = (
    ...functions: FunctionProperties<StorageWithStringSet>
  ) => {
    functions.forEach((functionProperty) => {
      type Property = typeof functionProperty
      const originalFunction = this[functionProperty].bind(this) as (...args: never[]) => void

      this[functionProperty] = (async (
        ...args: Parameters<StorageWithStringSet[Property]>
      ): Promise<ReturnType<StorageWithStringSet[Property]>> => {
        await this.whenDirectoryCreated
        return originalFunction(...(args as never[]))
      }) as never
    })
  }
}

const ONE_MB = 1024 * 1024

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

  const set = async (key: string, value: Value) => {
    const stringifiedPayload = JSON.stringify(value)

    const payloadExceedsThreshold = stringifiedPayload.length > threshold
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
