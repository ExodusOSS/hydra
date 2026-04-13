# TypeScript Conventions

Hydra-specific TypeScript patterns for features, modules, atoms, selectors, and packaging.

## Typing rules

1. Use `as const satisfies Definition` for IoC definitions.
2. Use `as const satisfies SelectorDefinition` for selectors.
3. Use `as const satisfies ReduxModuleDefinition<State>` for Redux modules.
4. Validate the emitted public `.d.ts` surface after `yarn build --scope @exodus/<pkg>`.
5. Inspect `lib/index.d.ts` and any emitted `lib/api/*.d.ts`, `lib/module/*.d.ts`, `lib/plugin/*.d.ts`, and `lib/redux/*.d.ts`.
6. Public declarations must not expose private class fields (`__#...`), concrete implementation classes, workspace-only import paths, or degraded `(...args: any[]) => any` method signatures unless those are intentionally part of the API.
7. Preserve consumer-facing type inference while hiding implementation details.
8. Ensure `exodus.*` API inference and `selectors.*` inference remain intact.
9. Do not erase feature or redux-module definition literals by widening exported values too early, for example by typing a feature factory as plain `Feature` when downstream typing depends on `definitions`, `selectorDefinitions`, or `initialState`.
10. Put type boundaries on implementation factories instead: exported module, plugin, and API factories should return small public interfaces, not concrete classes.
11. Verify that `createExodus(...).use(feature()).resolve()` exposes typed `exodus.<slice>.<method>` members and Redux setup exposes typed `selectors.<moduleId>.<selectorId>` members.
12. If a type appears in emitted `.d.ts`, its package must be resolvable by consumers and therefore listed in `dependencies` if needed at publish time.
13. Put types at the end of each file, after runtime code.
14. If a type is used in more than two files, move it to a shared `types.ts`.
15. If a type belongs in a shared Hydra package such as `@exodus/models` or `@exodus/atoms`, add it there instead of redefining it locally.
16. Do not use inline object types with 3 or more properties in function signatures. Extract named aliases such as `Dependencies` or `Params`.
17. Never use `any` or `unknown` in source files. For untyped dependencies, derive types from both usage and implementation.
18. Type every DI factory parameter, including modules, atoms, plugins, APIs, debug nodes, and reports.
19. Prefer domain model types over generic maps like `Record<string, any>`.

## Atoms and selectors

1. Never use `Atom<unknown>`; always parameterize atoms with their concrete value type.
2. Define shared atom aliases in `types.ts` so the same atom type is reused across files.
3. Pass typed `Storage<T>` into `createStorageAtomFactory` so inference stays correct.
4. If an atom has a `defaultValue`, its type must not include `undefined`.
5. Use `atom.reset()` instead of setting the default value manually.
6. Never inline selector types in `selectorFactory` or `resultFunction` params.
7. Create `<Feature>Selectors` in `redux/types.ts`, include both custom selectors and state-derived selectors, and export them from `redux/index.ts`.
8. Reference injected selectors with indexed access such as `WalletAccountsSelectors['filter']`.
9. If a selector factory needs a narrowed or external variant, define a named type alias in that selector file instead of inlining the signature.

## Class and API guidance

1. Export classes from module files so other files can `import type { MyClass }` instead of duplicating interfaces.
2. Use `WalletAccountParams` from `@exodus/models/lib/wallet-account/index.js` instead of `ConstructorParameters<typeof WalletAccount>[0]` when you need constructor argument types.

## Reference examples

Use `application`, `tx-signer`, `exchange`, and `address-book` as examples of feature packages that already follow the expected TypeScript structure.
