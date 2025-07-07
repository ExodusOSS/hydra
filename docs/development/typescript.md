# Typescript

If you're authoring your package in Typescript, read this.

## Path mappings

For TS modules, a path mapping to resolve the import correctly from the `src`
folder has to be added. This can be done in the top level `tsconfig.json`:

```json5
{
  // ...
  compilerOptions: {
    // ...
    paths: {
      // ...
      '@exodus/transform-storage': ['./libraries/transform-storage/src'],
      '@exodus/transform-storage/*': ['./libraries/transform-storage/src/*'],
    },
  },
}
```

The jest config for these modules, then also has to define a custom `moduleNameMapper`
that can be created from the paths definitions in our tsconfig to avoid duplication:

```js
module.exports = {
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),
}
```

A full example can be found [here](/features/tx-simulator/jest.config.cjs)

Please note that referencing files outside/above the module's directory, will cause tsc to nest
its build output in `module-name/src` and copy the locally referenced dependency to `outDir`.
Make sure an adequate `prepack` script is provided to cleanup and prepare the build output before packing.
