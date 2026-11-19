declare module '@exodus/basic-utils' {
  export function memoize<F extends (...args: any[]) => any>(
    func: F,
    resolver?: (...args: Parameters<F>) => unknown,
    timeout?: number
  ): F & { reset: () => void }
}

declare module '@exodus/dayjs'
