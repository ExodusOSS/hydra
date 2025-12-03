# `@exodus/i18n-babel-webpack`

Contains i18n related babel plugin & webpack loader

Babel & webpack-loader has commonjs requirements, so that this package is extracted from i18n to keep it in cjs

## Build tooling

### plugin-transform-t

The babel plugin [`plugin-transform-t`](https://github.com/ExodusMovement/exodus-hydra/blob/master/libraries/i18n-babel-webpack/babel/plugin-transform-t.js) is responsible for transforming invocations of `<T>` and `t` to a format that supplies the required
props/params to the underlying component/function. In the simplest case this looks as follows:

```js
<T>Test</T> // becomes <T id={"Test"} />
```

Things get more complicated when interpolation comes into play. For more information on what gets transformed how, please refer to [the tests](https://github.com/ExodusMovement/exodus-hydra/blob/master/libraries/i18n-babel-webpack/babel/__tests__/plugin-transform-t.test.js).

To use the plugin, simply reference it in your babel config:

```js
// babel.config.js

/** @type {import('@babel/core').ConfigAPI} */
module.exports = {
  presets: [createBabelConfig()],
  plugins: [
    ...expandPaths([
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@exodus/i18n/babel/plugin-transform-t',
    ]),
  ],
}
```

### plugin-inline-po

[This plugin](https://github.com/ExodusMovement/exodus-hydra/blob/master/libraries/i18n-babel-webpack/babel/plugin-inline-po.js) is optional and only to be used in projects that don't use webpack. It inlines `.po` file contents as object whenever it
encounters a require statement for a `.po` file. The disadvantage of this approach is that it adds all languages to the bundle and
therefore prevents lazy loading.

To use it, simply add `@exodus/i18n/babel/plugin-inline-po` to your babel.config.js `plugins`.

### webpack-loader

The preferred way of enabling support for `.po` files is using [the `webpack-loader`](./webpack-loader) that ships with this package.
To use it, add the following to your webpack config's module rules:

```js
const rules = [
  {
    test: /\.po$/,
    exclude: /node_modules/,
    use: path.resolve(__dirname, 'src/node_modules/@exodus/i18n/webpack-loader/index.js'),
  },
]
```
