# How features work and plug into the SDK

Let's dissect a simple feature in the Exodus SDK to understand how it works: the [top-movers-monitor](https://github.com/ExodusOSS/hydra/tree/master/features/top-movers-monitor/). This feature tracks assets that experienced the biggest gain or loss in value within a given time period.

Let's start at the top level, [the feature definition](https://github.com/ExodusOSS/hydra/tree/master/features/top-movers-monitor/index.js). This defines all the pieces of the feature. At the [time of writing](../../features/top-movers-monitor), this feature exports:

1. A public [topMoversAtom](../../features/top-movers-monitor/atoms/index.js). You can tell it's public because it has a `public: true` field in its definition. This means this atom is available as a dependency to all other features. Perhaps it should be `private`, but let's leave that for now.
2. A public [module](legos.md#modules) that tracks top movers locally or remotely, depending on how the feature is instantiated. By default it computes it locally. Whichever module is used, it receives a config of `{ minChangePercent, fetchInterval }`. The latter is most likely only relevant to the remote tracker.
3. A [plugin](legos.md#plugins), which likely connects the feature to the greater application lifecycle. This is a common pattern in Exodus features.
4. The feature definition does NOT export an ['api'](legos.md#api-slices) node. This means there's no `exodus.topMoversMonitor.xyz` API.
5. There's a [redux module](../../features/top-movers-monitor/redux/index.js) and one [custom selector](../../features/top-movers-monitor/redux/selectors/index.js).

Let's now zoom into each component of the feature:

## `topMoversAtom`

[This atom](legos.md#atoms) is very simple. It's [an in-memory atom](../../features/top-movers-monitor/atoms/top-movers.js#L3) that holds values of `{ gainers: [], losers: [] }`. Making schemas for atom values more explicit is on our TODO list, but for now you can take a look at [the data](../../features/top-movers-monitor/monitor/local.js#L48-L54) that the writer [writes to the atom](../../features/top-movers-monitor/monitor/local.js#L68).

## `topMoversMonitor`: local

The "local" [topMoversMonitor](../../features/top-movers-monitor/monitor/local.js#L7) is a small module that looks at data coming from [three other atoms](../../features/top-movers-monitor/monitor/local.js#L28-L32) (ratesAtom, currencyAtom, availableAssetNamesAtom), exposes a [start/stop](../../features/top-movers-monitor/monitor/local.js#L71-L79) pair of methods to observe/unobserve that data, and then a bunch of [business logic to compute the top movers](../../features/top-movers-monitor/monitor/local.js#L35) from those inputs. After that, it [writes the result](../../features/top-movers-monitor/monitor/local.js#L68) to the `topMoversAtom`

## `topMoversMonitor`: remote

The "remote" [topMoversMonitor](../../features/top-movers-monitor/monitor/remote.js#L7) is also very simple: it exposes a [start/stop](../../features/top-movers-monitor/monitor/remote.js#L66-L74) pair of methods to poll an API, has a bunch of [business logic to compute the top movers](../../features/top-movers-monitor/monitor/remote.js#L30) from the response, and as the "local" one, [writes the result](../../features/top-movers-monitor/monitor/remote.js#L58) to the `topMoversAtom`

## `topMoversLifecyclePlugin`

This is a [simple plugin](../../features/top-movers-monitor/plugin/index.js#L3) that implements hooks to the greater [application lifecycle](https://github.com/ExodusOSS/hydra/tree/master/sdks/headless#lifecycle):

- [onUnlock](../../features/top-movers-monitor/plugin/index.js#L23-L28): when the user unlocks the application, it starts the `topMoversMonitor`, conditional on the topMovers feature flag being enabled. Note: most features aren't gated by feature flags.
- [onStart/onLoad](../../features/top-movers-monitor/plugin/index.js#L15-L21): these make sure that data coming out of `topMoversAtom` gets reemitted to the `port`. When you call `exodus.subscribe(({ type, payload }) => {})`, you're getting events emitted to the `port`.
- [onStop](../../features/top-movers-monitor/plugin/index.js#L30-L32): this supports a graceful shutdown of the feature when the application is stopped, by unobserving the `topMoversAtom`.

## Redux module

Remember [the event](../../features/top-movers-monitor/plugin/index.js#L12) emitted in the `topMoversLifecyclePlugin`? To ingest the data from that event into redux, we declare [a reducer for that event](../../features/top-movers-monitor/redux/index.js#L9-L14) in the feature's redux module definition.

Looking at the [redux module's id](../../features/top-movers-monitor/redux/id.js), we know that selectors will become available at `selectors.topMovers.xyz`, and based on the [initialState](../../features/top-movers-monitor/redux/initial-state.js#L1-L4), two selectors will be auto-generated for us: `selectors.topMovers.loaded` and `selectors.topMovers.data`. There's also a [custom selector](../../features/top-movers-monitor/redux/selectors/all.js) that filters down the gainers/losers by removed tokens, if those are available at runtime.
