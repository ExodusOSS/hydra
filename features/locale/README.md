# @exodus/locale

Module for tracking users locale data such as language and currency

## Install

```sh
yarn add @exodus/locale
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/locale
2. Try out some methods via the UI. These correspond 1:1 with the `exodus.locale` API.
3. Run `await exodus.locale.setCurrency('GBP')` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
await exodus.locale.setLanguage('nl')

await exodus.locale.setCurrency('EUR')
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```jsx
import { selectors } from '~/ui/flux'

const LocaleDisplay = () => {
  const language = useSelector(selectors.locale.language)
  const currrency = useSelector(selectors.locale.currency)

  return (
    <Text>
      Language: {language}
      Currency: {currency}
    </Text>
  )
}
```
