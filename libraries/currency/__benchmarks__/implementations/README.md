# Exodus Currency - Benchmarks/Implementations

This package allows you to benchmark different implementations of the `@exodus/currency` module. By default, the "archived" versions in `./modules` get benchmarked as well as the code in `../../src` (the current local version of `@exodus/currency`).

## Install deps

`yarn`

_this will automatically install all deps in `./modules/_`

## Run benchmark

`yarn start`

## Adding a new "archived" module version

- Copy the `../../src` => `/modules/NAME_YOU_WANT`
- Add a `package.json` with the deps that the version needs
- `yarn` to install those deps
- To make sure your copied version is working right, run `yarn test` on the workspace root folder. This will run your copied version's tests as well as the other tests in the workspace.
- Once all passing, rename the `__tests__` folder in the copied version to `__skipped-tests__` so they don't keep running with the workspace's tests.
