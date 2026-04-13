[![Checks](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/checks.yaml/badge.svg?branch=master)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/checks.yaml) [![Version](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/version.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/version.yaml) [![Publish](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/publish.yaml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/publish.yaml) [![CodeQL](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/codeql.yml/badge.svg)](https://github.com/ExodusMovement/exodus-hydra/actions/workflows/codeql.yml)

# exodus-hydra

> [!WARNING]
> This repository has a public mirror at [ExodusOSS/hydra](https://github.com/ExodusOSS/hydra). Please act accordingly.

> Hydra, a many-headed serpent in Greek mythology

This is the monorepo that is home to the many components of the Exodus SDK.

## Agentic PR review

This repo runs Codex reviews through GitHub Agentic Workflows and complements them with GitHub Copilot Pull Request Reviews.

- Codex reviews use `.github/workflows/codex-pr-review.md` (source) and the compiled `.lock.yml`; the workflow relies on `OPENAI_API_KEY` (or `CODEX_API_KEY` for legacy setups) and accepts repository vars like `GH_AW_MODEL_AGENT_CODEX` for tuning. After modifying `.github/workflows/codex-pr-review.md`, re-run `gh aw compile` from the repo root.
- Copilot Pull Request Reviews are configured via the Copilot GitHub App/Actions in the repo (not managed inside these workflows).

This repo does not expose a GUI for the Codex workflow, but you can tune it either by setting repository variables such as `GH_AW_MODEL_AGENT_CODEX` or by editing `.github/workflows/codex-pr-review.md` and, from the repo root, re-running `gh aw compile`.

Common customizations live in the workflow frontmatter, for example:

- `engine.model` to pin a specific Codex model
- `engine.env` for engine-specific environment variables
- the markdown body to change review behavior and instructions

The compiled workflow currently also accepts `CODEX_API_KEY` as a compatibility fallback, but `OPENAI_API_KEY` is the standard secret documented by GitHub Agentic Workflows for the Codex engine.

The workflow intentionally uses the `pull_request` event rather than `pull_request_target`. That keeps the OpenAI secret out of forked PR runs by default, which is the safer starting point for GitHub Actions-based review.

## Getting started

Please sort yourself into one of the six houses:

- Play with the SDK immediately: visit the playground at [https://exodus-hydra.pages.dev/](https://exodus-hydra.pages.dev/). For now it's restricted to those with Exodus email but we hope to open this up soon.
- [Use the SDK to build an app](https://docs.exodus.com/development/using-the-sdk)
- [Learn how "features" work and plug into the SDK](https://docs.exodus.com/development/dissecting-a-feature)
- [Troubleshoot the SDK](https://docs.exodus.com/development/troubleshooting)
- [Learn how to navigate this repo](#learn-how-to-navigate-this-repo)

### Learn how to navigate this repo

In this repo you'll find legos of different sizes, from the low level, e.g. cryptographic libraries, to the high level, e.g. features that plug into the Exodus SDK, and everything in between. Please read the [lego manual](https://docs.exodus.com/development/legos) before having any fun.

Now that you're back, here's a quick overview of repo structure:

- [./adapters](./adapters): platform adapters for web, mobile, desktop, etc. This is where all platform-specific code is contained and everything else should be platform agnostic. Don't let the platforms leak out!
- [./features](./features): [feature legos](https://docs.exodus.com/development/legos#features) - domain-specific groupings of atom(s), module(s) and plugin(s) that plug into the SDK with `sdk.use(feature(config))`
- [./modules](./modules): [module legos](https://docs.exodus.com/development/legos#modules) - module legos that aren't quite big enough to put on feature pants - legacy and need to be wrapped into features.
- [./libraries](./libraries): [library legos](https://docs.exodus.com/development/legos#libraries) - stateless utils like lodash, eslint plugins, currency manipulation utils, REST clients, etc.
- [./sdks](./sdks): SDKs combine all of the above into a single object that encapsulates the application lifecycle and exports namespaced [APIs](https://docs.exodus.com/development/legos#api-slices) of all component features. You'll typically see it used in the UI under the name `exodus`, e.g. `exodus.wallet.create()` or `exodus.addressProvider.getDefaultAddress({ walletAccount, assetName })`. At the moment we have two SDK flavors. Most of the time you'll use [./sdks/headless](./sdks/headless), but if you need something super lightweight with no features built-in, use [./sdks/argo](./sdks/argo).
- [./tools](./tools): local eslint plugins, nx generators, vscode snippets, etc.

### Contributing

Done with the required reading? See [how to contribute](./CONTRIBUTING.md).
