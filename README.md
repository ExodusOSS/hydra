[![Checks](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/checks.yaml/badge.svg?branch=master)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/checks.yaml) [![Version](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/version.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/version.yaml) [![Publish](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/publish.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/publish.yaml) [![CodeQL](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/codeql.yml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/codeql.yml)

# exodus-hydra

> [!WARNING]
> This repo is shared with at least one other organization. It may one day be public. Be extra careful not to upload API keys / secrets / personal details, keep your discourse civil and turn your humor dials to 11.

> Hydra, a many-headed serpent in Greek mythology

This is the monorepo that is home to the many components of the Exodus SDK.

## Getting started

Please sort yourself into one of the six houses:

- Play with the SDK immediately: visit the playground at [https://exodus-hydra.pages.dev/](https://exodus-hydra.pages.dev/). For now it's restricted to those with Exodus email but we hope to open this up soon.
- [Use the SDK to build an app](docs/development/using-the-sdk.md)
- [Learn how "features" work and plug into the SDK](docs/development/dissecting-a-feature.md)
- [Troubleshoot the SDK](docs/development/troubleshooting.md)
- [Learn how to navigate this repo](#learn-how-to-navigate-this-repo)

### Learn how to navigate this repo

In this repo you'll find legos of different sizes, from the low level, e.g. cryptographic libraries, to the high level, e.g. features that plug into the Exodus SDK, and everything in between. Please read the [lego manual](docs/development/legos.md) before having any fun.

Now that you're back, here's a quick overview of repo structure:

- [./adapters](./adapters): platform adapters for web, mobile, desktop, etc. This is where all platform-specific code is contained and everything else should be platform agnostic. Don't let the platforms leak out!
- [./features](./features): [feature legos](docs/development/legos.md#features) - domain-specific groupings of atom(s), module(s) and plugin(s) that plug into the SDK with `sdk.use(feature(config))`
- [./modules](./modules): [module legos](docs/development/legos.md#modules) - module legos that aren't quite big enough to put on feature pants - legacy and need to be wrapped into features.
- [./libraries](./libraries): [library legos](docs/development/legos.md#libraries) - stateless utils like lodash, eslint plugins, currency manipulation utils, REST clients, etc.
- [./sdks](./sdks): SDKs combine all of the above into a single object that encapsulates the application lifecycle and exports namespaced [APIs](docs/development/legos.md#api-slices) of all component features. You'll typically see it used in the UI under the name `exodus`, e.g. `exodus.wallet.create()` or `exodus.addressProvider.getDefaultAddress({ walletAccount, assetName })`. At the moment we have two SDK flavors. Most of the time you'll use [./sdks/headless](./sdks/headless), but if you need something super lightweight with no features built-in, use [./sdks/argo](./sdks/argo).
- [./tools](./tools): local eslint plugins, nx generators, vscode snippets, etc.

### Contributing

Done with the required reading? See [how to contribute](./CONTRIBUTING.md).
