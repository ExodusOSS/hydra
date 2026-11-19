# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/ExodusMovement/exodus/compare/@exodus/argo@2.3.0...@exodus/argo@2.3.1) (2026-10-13)

**Note:** Version bump only for package @exodus/argo

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.2.4...@exodus/argo@2.3.0) (2026-07-01)

### Features

- **headless:** type redux IOC selectors ([#16944](https://github.com/ExodusMovement/exodus-hydra/issues/16944)) ([2bf3b9b](https://github.com/ExodusMovement/exodus-hydra/commit/2bf3b9bd7b3d211c4a72b73f3572b1937bc8eb99))

### Bug Fixes

- **argo:** add package.json exports map ([#17429](https://github.com/ExodusMovement/exodus-hydra/issues/17429)) ([61bde73](https://github.com/ExodusMovement/exodus-hydra/commit/61bde73f658c1dedf12c680c066e55d7f55d6d2e))

## [2.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.2.3...@exodus/argo@2.2.4) (2026-06-05)

### ⚠ BREAKING CHANGES

- **redux-dependency-injection:** `setupRedux` no longer accepts an `initialState`
  parameter. Callers passing it must remove that property — every known
  caller passed `{}` so the migration is mechanical.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- fix(argo): drop now-rejected initialState arg from setupRedux call

Mechanical follow-up to @exodus/redux-dependency-injection dropping
the `initialState` parameter. The `initialState: {}` line was always a
no-op; with the new major it would throw at runtime.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- test: drop now-unused initialState arg from setupRedux test fixtures

Mechanical follow-up to the @exodus/redux-dependency-injection major in
the previous commit. The `setupRedux({initialState: {}})` line in each
fixture was always a no-op; it now type-errors and must be removed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- feat(redux-dependency-injection): throw on passed `initialState` for unmigrated callers

TypeScript catches `setupRedux({ initialState })` at the type level for
typed callers — but excess-property checks don't fire on
generic-constrained params, JS callers have no type wall at all, and
any-typed wrappers slip through. Add a runtime guard so unmigrated
consumers get a clear error pointing them at the module-level
`initialState` field instead of silent no-op behavior.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- fix(redux-dependency-injection): preserve empty-object state fallback for module-less deps

When `setupRedux` is called with `dependencies: []` (or an array
containing only `DependencyNodeDefinition`s with no redux-modules),
the distributive mapped type collapses to `UnionToIntersection<never>`,
which widens to `unknown` and leaks through to `initialState` and the
reducer signature.

Guard with an explicit `Record<string, never>` fallback when no
redux-module arms are present in the dependency union. Matches the
runtime, where `buildInitialState` returns an empty object in that
case. Adds a `__tests__/types.ts` assertion that locks the fallback in
structurally.

### Features

- **redux-dependency-injection:** drop unused setupRedux initialState ([#16561](https://github.com/ExodusMovement/exodus-hydra/issues/16561)) ([c906a8c](https://github.com/ExodusMovement/exodus-hydra/commit/c906a8c8cd2258060f55f0a45412b82c827dbbaa))

## [2.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.2.2...@exodus/argo@2.2.3) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.2.1...@exodus/argo@2.2.2) (2024-10-14)

### Bug Fixes

- downgrade redux so we can dedupe downstream ([#9951](https://github.com/ExodusMovement/exodus-hydra/issues/9951)) ([3468699](https://github.com/ExodusMovement/exodus-hydra/commit/346869940616de0e17aef2de7a46e4fe1debb08f))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.2.0...@exodus/argo@2.2.1) (2024-10-03)

**Note:** Version bump only for package @exodus/argo

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.1.0...@exodus/argo@2.2.0) (2024-09-09)

### Features

- **argo:** implement argo redux IOC ([#8852](https://github.com/ExodusMovement/exodus-hydra/issues/8852)) ([62de3fb](https://github.com/ExodusMovement/exodus-hydra/commit/62de3fbe3d2da0479893582dadffbb5ff4083b02))

### Bug Fixes

- adjust ReduxIOCParams type ([#8972](https://github.com/ExodusMovement/exodus-hydra/issues/8972)) ([25dbb0c](https://github.com/ExodusMovement/exodus-hydra/commit/25dbb0c01aa953e56944fddc51b0507d3a450822))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@2.0.0...@exodus/argo@2.1.0) (2024-08-13)

### Features

- make exodus/argo an ESM module ([#8336](https://github.com/ExodusMovement/exodus-hydra/issues/8336)) ([e26f756](https://github.com/ExodusMovement/exodus-hydra/commit/e26f756b657e0bb716a047d46377e303983f0664))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.4.0...@exodus/argo@2.0.0) (2024-07-26)

**Note:** Version bump only for package @exodus/argo

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.3.2...@exodus/argo@1.4.0) (2024-07-26)

### Features

- improve resilience against garbage registration ([#8090](https://github.com/ExodusMovement/exodus-hydra/issues/8090)) ([7f82cc8](https://github.com/ExodusMovement/exodus-hydra/commit/7f82cc88ba2a1a02095f31c3d3ef811b08b2d6d8))

## [1.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.3.1...@exodus/argo@1.3.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [1.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.3.0...@exodus/argo@1.3.1) (2024-07-16)

**Note:** Version bump only for package @exodus/argo

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.5...@exodus/argo@1.3.0) (2024-07-12)

### Features

- add errorTracking feature to sdk ([#7670](https://github.com/ExodusMovement/exodus-hydra/issues/7670)) ([34dbc5c](https://github.com/ExodusMovement/exodus-hydra/commit/34dbc5c1f0b94ef4213dfaec788790c475eb962c)), closes [#7708](https://github.com/ExodusMovement/exodus-hydra/issues/7708)

## [1.2.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.4...@exodus/argo@1.2.5) (2024-07-11)

### Bug Fixes

- use correct type for argo export ([#7669](https://github.com/ExodusMovement/exodus-hydra/issues/7669)) ([1e9458f](https://github.com/ExodusMovement/exodus-hydra/commit/1e9458feb7ef6c43f9672abe6b1e18435fde1fc1))

## [1.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.3...@exodus/argo@1.2.4) (2024-07-08)

### Bug Fixes

- make IoC packages proper ESM ([#7676](https://github.com/ExodusMovement/exodus-hydra/issues/7676)) ([d3348be](https://github.com/ExodusMovement/exodus-hydra/commit/d3348bee9016860c5702af3df84d14440d6d0cf4))

## [1.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.2...@exodus/argo@1.2.3) (2024-06-25)

**Note:** Version bump only for package @exodus/argo

## [1.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.1...@exodus/argo@1.2.2) (2024-06-19)

### Bug Fixes

- **types:** support preprocessor config on ioc node ([#7446](https://github.com/ExodusMovement/exodus-hydra/issues/7446)) ([411eb29](https://github.com/ExodusMovement/exodus-hydra/commit/411eb2951cc702f2219987a7a0091d3a6ae2306f))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.2.0...@exodus/argo@1.2.1) (2024-06-18)

### Bug Fixes

- **types:** extend within given constraints ([#7419](https://github.com/ExodusMovement/exodus-hydra/issues/7419)) ([b38e690](https://github.com/ExodusMovement/exodus-hydra/commit/b38e690a332f6cb3cd376597a09a35445788efed))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.1.2...@exodus/argo@1.2.0) (2024-06-13)

### Features

- add identification to atoms [#7261](https://github.com/ExodusMovement/exodus-hydra/issues/7261) ([#7357](https://github.com/ExodusMovement/exodus-hydra/issues/7357)) ([02cb880](https://github.com/ExodusMovement/exodus-hydra/commit/02cb8807bbd2a9ff89165cc7424071d0f0453f7f))

## [1.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.1.1...@exodus/argo@1.1.2) (2024-05-28)

### Bug Fixes

- accept readonly arrays in `registerMultiple` ([#7166](https://github.com/ExodusMovement/exodus-hydra/issues/7166)) ([ffd6350](https://github.com/ExodusMovement/exodus-hydra/commit/ffd6350d60482c8b303ecbb161c6b51cadd1fc78))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.1.0...@exodus/argo@1.1.1) (2024-05-28)

### Bug Fixes

- make dependencies optional ([#7156](https://github.com/ExodusMovement/exodus-hydra/issues/7156)) ([77c2872](https://github.com/ExodusMovement/exodus-hydra/commit/77c2872789f2713dd95e34c85c0a539dce0897a2))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/argo@1.0.0...@exodus/argo@1.1.0) (2024-04-26)

### Features

- add type declarations to argo ([#6571](https://github.com/ExodusMovement/exodus-hydra/issues/6571)) ([e6054e3](https://github.com/ExodusMovement/exodus-hydra/commit/e6054e3281c0026d9f777b8756c1013261ea050e))
- type headless api ([#6583](https://github.com/ExodusMovement/exodus-hydra/issues/6583)) ([0a6d67f](https://github.com/ExodusMovement/exodus-hydra/commit/0a6d67fee1a0f115fb72e1f57c6ee5068d8f7345))

## 1.0.0 (2024-02-01)

**Note:** Initial release for package @exodus/argo, extracted from @exodus/headless
