# `@exodus/i18n`

The gateway to a more accessible crypto world for all of our users, no matter what language they speak.

## Usage

`@exodus/i18n` is built on three pillars:

- A set of React components, a hook, and a factory for a static i18n
- Build tooling that ensures that these react components are a no-brainer to use and helps with loading the translation files
- A CLI that deals with the automatic extraction of message IDs from `<T>` and `t` invocations

### React components

#### I18nProvider

At the top of your component hierarchy, include the `I18NProvider`. It is responsible for providing the current language
and available locales to components further downstream.

```jsx
import { I18nProvider } from '@exodus/i18n'

const I18n = () => {
  // ...
  return (
    <I18nProvider
      locale={locale}
      locales={locales}
      setLocale={setLocale}
      currency={currency}
      defaultLanguage={DEFAULT_LANGUAGE}
      defaultCurrency={DEFAULT_CURRENCY}
    >
      {children}
    </I18nProvider>
  )
}

// Where `locales` are created from the PO files:
// locales.js
import en from '~/locales/en/messages.po'
import de from '~/locales/de/messages.po'

export default { en, de }
```

#### T and t

`T` is a component that can be used in jsx directly, whereas `t` is a function that returns a translated string.

```js
import { T, useI18n } from '@exodus/i18n'

const MyComponent = () => (
  <Title>
    <T>This is a localized message</T>
  </Title>
)

const MyOtherComponent = () => {
  const { t } = useI18n()
  const title = t('Buy all the crypto')

  useEffect(() => {
    showModal({ title })
  }, [title])

  return null
}
```

> **Warning**
> It is also possible to import `t` globally, as opposed to using it with the `useI18n` hook. The global version of `t`
> returns `<T>{arg}</T>` instead of the translated input.

## Best practices

You can use this library in many different ways. See best practices below.

### Always import i18n where you use it

The CLI of this library relies on imports to detect where it is used. If you use a translation method inside a file without importing i18n or specifying a [custom module](#re-exported-expressions) in the config, an extraction might not work correctly.

The following example shows how not to do it since the newline won't get escaped and will be in the PO file as an actual newline, breaking it in the end.

```js
// Bad

const BatmobileFuel = ({ t, quantity }) => (
  <>
    <FuelIcon />
    {t(`Fuel Quantity:\n${quantity}`)}
  </>
)
```

If the hook is imported and used, everything will be as expected.

```js
// Good

import { useI18n } from '@exodus/i18n'

const BatmobileFuel = ({ quantity }) => {
  const { t } = useI18n()

  return (
    <>
      <FuelIcon />
      {t(`Fuel Quantity:\n${quantity}`)}
    </>
  )
}
```

Lastly, here is an example that shows a i18n config with custom module that exports a static i18n
instance.

```json
{
  "sourceLocale": "en",
  "locales": "src/locales/{locale}/messages.po",
  "additionalModules": ["./localization"]
}
```

```js
// Good with corresponding config

import { t } from './localization'

const getBatmobileFuel = (quantity) => t(`Fuel Quantity:\n${quantity}`)
}
```

### When to use which translation method

As a rule of thumb, try to use the hook whenever possible. `t` and `T` exported from the library are just utility wrappers around the hook and add unnecessary layers.

There are situations where you have nested JSX in a localized string. In this case, you want to use `T` since the hook only supports strings.

```jsx
<T>
  This is <Highlight>important</Highlight>
</T>
```

If you are outside of a React component, fear not, there is also a factory method, `createI18NStatic`, that allows you to create a static i18n instance without a context.
This does not support locale switching on the fly and most likely requires you to restart your application.

### Avoid conditional expressions in `t`

A conditional expression, also called a ternary operator, makes it hard for the translator to understand the message to be translated and might create grammar issues in other languages.

Try to move these to the outside of your translation function.

```js
// Bad

t(evil ? 'Joker' : 'Batman')

// Good

evil ? t('Joker') : t('Batman')
```

### No optional chaining in `t`

We currently do not support optional chaining inside of `t`.

```js
// Bad

t(`Joker's real name is ${data.joker?.realName}`)
t(`Batman's health is ${data.joker?.getHealth()}`)
t(`Batman's health is ${batman.getHealth?.()}`)

// Good

const health = batman.getHealth?.()
t(`Batman's health is ${health}`)
```

### Use eslint-plugin-i18n

We provide an [ESlint plugin](https://github.com/ExodusMovement/exodus-hydra/tree/master/libraries/eslint-plugin-i18n) for the above-mentioned things. Use the linter, Luke!

## CLI

[The CLI](./cli) extracts message IDs from your app, and creates corresponding entries in the translation files. It can be used
calling `i18n extract .` or added as a script to your `package.json`, f.i. in the root package.json:

```json5
{
  //...
  scripts: {
    'i18n:extract': './src/node_modules/.bin/i18n extract ./src',
  },
}
```

### Ignore files when extracting

You can exclude specific files from the extraction using the `ignoreRegex` property of the `.i18nrc` config file.
It requires a valid regular expression and defaults to `node_modules|__tests__` when none is provided.

```json
{
  "sourceLocale": "en",
  "locales": "src/locales/{locale}/messages.po",
  "ignoreRegex": "node_modules|__tests__|vendor"
}
```

### Re-exported expressions

To ensure the CLI only extracts relevant expressions, it checks the module name of import statements.
If you want to use i18n from another module than the lib itself and have a successful extraction,
you must first adapt your project according to one of the following approaches.

#### Config

The `.i18nrc` config file allows you to specify module names that the CLI should check in addition
its own name. Add your custom module to the `additionalModules` property.

```json
{
  "sourceLocale": "en",
  "locales": "src/locales/{locale}/messages.po",
  "additionalModules": ["#/localization"]
}
```

#### Alias

Provide an alias pointing to your custom module, so that you can import it as `@exodus/i18n`.

Alias setup:

```json
{
  "~": "project-root",
  "@exodus/i18n": "./localization.js"
}
```

`localization.js`:

```js
export { T } from '~/node_modules/@exodus/i18n'
```

`potter.js`:

```js
import { T } from '@exodus/i18n'

const Potter = () => <T>Harry Potter</T>

export default Potter
```

### HOC and decorators

This lib comes with the `withI18n` HOC that allows you to wrap your class components and get a `t` instance via the props.
One way of using it would be via a decorator.

```js
import { withI18n } from '@exodus/i18n'

@withI18n
class SomeComponent extends React.PureComponent {
  render = () => {
    const { t } = this.props
    return <div title={t('Some String')} />
  }
}

export default SomeComponent
```

If you want use a custom decorator, you need to specify this decorator in the `.i18nrc` config file. Otherwise, i18n will not be able to detect your translations properly and transform them.

The `additionalDecorators` property allows you to specify decorator names that i18n should look for in addition to the built-in one `withI18n`.

```json
{
  "sourceLocale": "en",
  "locales": "src/locales/{locale}/messages.po",
  "additionalDecorators": ["withCustomI18n"]
}
```
