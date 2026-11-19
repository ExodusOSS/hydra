// The instanceof test uses a `?version=` query-string suffix on a dynamic
// import to bypass the module cache and force a fresh copy. Declare the
// query-string variants of native-bigint.js so they typecheck. Pattern scoped
// to `native-bigint.js?version=*` to avoid catching unrelated future imports.

declare module '*/native-bigint.js?version=v1' {
  export { default } from './native-bigint.js'
}

declare module '*/native-bigint.js?version=v2' {
  export { default } from './native-bigint.js'
}
