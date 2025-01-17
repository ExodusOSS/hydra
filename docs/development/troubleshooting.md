# Troubleshooting

## CI

This repo uses sophisticated caching courtesy of nx and Github Actions. When changing non-module-local
configuration/code, you may want to clear the cache in the CI to force checks to re-run. You can do so
by running `yarn cache:delete` or use the [GH page](https://github.com/ExodusMovement/exodus-hydra/actions/caches) for
managing caches. The CLI client has the advantage of being able to purge all caches for a given branch. This is
currently not supported in the UI.

## SDK

### My data isn't in the redux state

Check the following:

- Your feature's lifecycle plugin is properly plugged into the application lifecycle. Make sure it's actually emitting events over the port. `exodus.subscribe(console.log)` will log all events emitted to the port.
- You've included your feature's redux module in the UI side dependencies you pass to `@exodus/redux-dependency-injection`. See [an example in the playground](https://github.com/ExodusMovement/exodus-hydra/blob/7fd8caae7284c7a04f4d5daa69d408885cf51655/apps/sdk-playground/src/ui/flux/index.ts#L10).
- Your redux module has reducers in `eventReducers` with keys matching the event names emitted by your plugin.
