import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage/lib/typescript/types'

export type Filesystem = {
  /**
   * Recursively removes directories, behaves same as rm -rf
   * @param path
   */
  rimraf: (path: string) => Promise<void>

  /**
   * Creates a directory and all directories along the path, behaves same as mkdir -p
   * @param path
   */
  mkdirp: (path: string) => Promise<void>

  readUtf8: (key: string) => Promise<string>
  writeUtf8: (key: string, value: string) => Promise<void>
}

export type ErrorTracking = {
  track: (params: { error: Error }) => Promise<void>
}

export type Dependencies = {
  asyncStorage: AsyncStorageStatic
  errorTracking?: ErrorTracking
  androidFallback?: {
    filesystem: Filesystem
    /** Maximum JSON-serialized size in UTF-8 bytes before falling back to files. */
    threshold?: number
    rootDir: string
    placeholder?: string
    hashString: (value: string) => string
  }
}

export type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T][]
