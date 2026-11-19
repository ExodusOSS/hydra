declare module 'minimalistic-assert' {
  export default function assert(condition: unknown, message?: string): asserts condition
}
