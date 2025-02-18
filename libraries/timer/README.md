# @exodus/timer

Timer helper class

## Install

```
    yarn add @exodus/timer
```

## Usage

Timer that allows scheduling tasks at fixed intervals (ticks). It keeps track of the running timers statically. You can start, pause, stop or clear all the tasks.

Starting the timer with `start()` will execute the first tick unless the `delayedStart` option is supplied. When started without a `delayStart`, `start()` may throw an exception if `tick()` throws. To prevent `start()` from failing, make sure you handle the errors appropriately.

### Start timer async

With async start, make sure you catch any unhandled errors.

```js
const timer = new Timer(100)
timer.start(() => this.hello(options)).catch((err) => {})
await timer.stop()
```

### Start timer sync

If you need to wait for the first tick to complete, start the timer like this:

```js
const timer = new Timer(100)
try {
  await timer.start(() => this.hello(options))
} catch (err) {}
await timer.stop()
```

Note that awaiting for start also waits for the first tick to complete. This may delay the startup operation especially with long-running ticks.
