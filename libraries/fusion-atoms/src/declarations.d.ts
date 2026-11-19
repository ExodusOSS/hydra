declare module '@exodus/atom-tests' {
  interface AtomTestsOptions {
    name: string
    factory: (options?: { defaultValue?: unknown; initialValue?: unknown; logger?: unknown }) => {
      atom: unknown
      set?: unknown
    }
    isWritable?: boolean
    isObservable?: boolean
  }
  export default function atomTests(options: AtomTestsOptions): void
}
