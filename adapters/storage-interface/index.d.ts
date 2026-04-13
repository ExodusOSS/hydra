export interface Storage<In = unknown, Out = In> {
  get(key: string): Promise<Out | undefined>
  batchGet(keys: string[]): Promise<(Out | undefined)[]>
  set(key: string, value: In): Promise<void>
  batchSet(obj: { [key: string]: In }): Promise<void>
  delete(key: string): Promise<void>
  batchDelete(keys: string[]): Promise<void>
  clear(): Promise<void>
  namespace(prefix: string): Storage<In, Out>
  namespace<In>(prefix: string): Storage<In>
  namespace<In, Out>(prefix: string): Storage<In, Out>
}
