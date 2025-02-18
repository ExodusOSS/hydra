# Development

_Note: see also [troubleshooting](troubleshooting.md)._

## Setup

Run `yarn npm login`, as this repository uses a modern version of yarn that doesn't support `.npmrc` files anymore and you'll be installing tons of Exodus' private packages. This has to be done once only. After that, you can install dependencies as usual.

## Creating a new package

Run `yarn generate` to see a list of available templates and scaffold a library/feature/module/etc.

## Code Snippets

Are you tired of repeatedly typing the same scaffold code? This can be especially cumbersome when working on IOC definitions. But fret not, we've got you covered! Hydra offers a custom snippet extension for VSCode, elevating your coding experience. Simply execute the following command at the root:

```sh
./node_modules/.bin/lerna run setup --scope vscode-snippets
```

You can explore the complete list of available code snippets [here](https://github.com/ExodusOSS/hydra/blob/master/tools/packages/vscode-snippets/README.md).

## Linking

While developing a package in this monorepo, you may want to test it in a repo that consumes it. Unfortunately we can't use `npm link` because mobile's packager `metro` doesn't support symlinks (yet). However, we have a similar tool here to help you sync your changes to the client repos before you publish a new version.

To link your module to a client repo, run:

```
yarn run -T sync module-name,other-module-name /path/to/client-repo
```

This will start a watch process that syncs the specified modules to `src/node_modules` in that repo.

## Test

Examples:

```
# test one library
yarn test --scope @exodus/fiat-client
```

## Build

If your module needs transpiling (i.e. Babel or Typescript) before publishing, make sure to add
a `build` script to the `package.json` of the module.

Examples:

```
# build all
yarn build

# build one library
yarn build --scope @exodus/fiat-client
```
