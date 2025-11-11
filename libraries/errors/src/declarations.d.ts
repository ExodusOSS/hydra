declare module '@exodus/basic-utils' {
  type MemoizedFunction<T extends (...args: any[]) => any> = T

  export function memoize<T extends (...args: any[]) => any>(func: T): MemoizedFunction<T>
}
