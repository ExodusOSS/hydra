declare module '@exodus/typeforce' {
  const typeforce: (type: unknown, value: unknown, strict?: boolean, surpress?: boolean) => boolean

  export default typeforce
}
