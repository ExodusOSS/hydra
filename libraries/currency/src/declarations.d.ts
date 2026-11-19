// Ambient declarations for runtime-only dependencies whose own packages do
// not (yet) ship TypeScript types. Scope: only what `@exodus/currency`
// actually invokes.

declare module 'minimalistic-assert' {
  export default function assert(condition: unknown, message?: string): asserts condition
}
