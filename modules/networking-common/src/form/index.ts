export type BlobLike = {
  size?: number
  type?: string
  arrayBuffer(): Promise<ArrayBuffer>
}
export type FormDataEntryValue<T> = T | string

export type FileLike = BlobLike & { name: string }
export type FormDataLike<TFileInitializer = BlobLike, TFileLike = FileLike> = {
  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue<TFileLike>]>

  entries(): IterableIterator<[string, FormDataEntryValue<TFileLike>]>
  keys(): IterableIterator<string>
  values(): IterableIterator<FormDataEntryValue<TFileLike>>

  append(name: string, value: string): void
  append(name: string, value: TFileInitializer, fileName: string): void
  delete(name: string): void
  get(name: string): FormDataEntryValue<TFileLike> | null
  getAll(name: string): FormDataEntryValue<TFileLike>[]
  has(name: string): boolean
  set(name: string, value: string): void
  set(name: string, value: TFileInitializer, fileName: string): void
}
