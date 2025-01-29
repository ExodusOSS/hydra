# Release Process

## Version

To version your packages, either:

- merge a PR with eligible commit type. The following don't trigger a release: `chore`, `docs`, `test`, `ci`
- run `yarn release` and select the package(s) you want to release
- run `yarn release` and supply packages as a positional argument: `yarn release networking-mobile,kyc,storage-mobile`

All of these derive version bumps from the conventional commit history and create a release PR, labeled with `publish-on-merge`. Make sure that the checks on the release PR pass, especially when releasing packages that depend on other packages from this repository.

## Publish

All packages that received a version bump in the previous step are automatically published to npm after merging
the release PR. The tags listed in the PR body will be added to the merge commit.

Initial versions can be published by manually executing the publish workflow. All packages with versions not currently present in the registry will be published.

## Dependency Management

### My Pull Request Broke Downstream Packages

Your pull request changing package A broke package B. You might just need to fix B's tests, e.g. to update how it mocks A, or you might need to ship a patch/minor/major version for B.

Either way, create a PR chain. Fixes, new features or breaking changes for A should only affect that package's version and changelog, and should be isolated in the first PR. Address downstream changes in child PRs. To avoid failing checks on master for an extended period, the chain should not be merged manually. Instead, apply the label `action/merge-chain` to the tip of the PR chain. Our custom github action [chain-merge-action](https://github.com/exodusmovement/chain-merge-action) will merge the first PR, rebase the following PR onto master, and continue on merging until the entire chain is merged.

Example 1:

1. [feat: add full key identifier to address meta](https://github.com/ExodusOSS/hydra/pull/7595) broke downstream tests in headless. As this PR doesn't introduce a feature in headless, fixes to headless tests were placed in the child PR.
2. [test: fix headless tests](https://github.com/ExodusOSS/hydra/pull/7742) fixed headless tests.

The chain was merged by applying the `action/merge-chain` label to the child PR.

Example 2:

1. [feat!: extract remote config atoms](https://github.com/ExodusOSS/hydra/pull/7817) broke all consumers of `@exodus/atoms` that used the `createRemoteConfigAtomFactory` export.
2. [refactor: use @exodus/remote-config-atoms](https://github.com/ExodusOSS/hydra/pull/7820) refactored consumers of that export to use the new `@exodus/remote-config-atoms` package

The chain was merged by applying the `action/merge-chain` label to the child PR.

### Inter-package

If your package requires referencing one of the packages maintained in this mono repo and you want
to consume the latest unpublished changes without having to set a specific version, you have to
manually add that dependency to `package.json` and set the version to `*`. This manual step is
currently required because of an incompatibility between more recent yarn versions (berry) and
lerna.

Latest code changes are automatically reflected in the import and versioning/publishing
takes care of keeping the version in the module's `package.json` up-to-date.
