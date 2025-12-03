declare module '@exodus/typeforce' {
  function typeforce(type: unknown, value: unknown): void
  export default typeforce
}

declare module '@exodus/crypto/randomUUID' {
  export function randomUUID(): string
}
