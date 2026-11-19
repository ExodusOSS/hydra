# Troubleshooting

## SDK

### My data isn't in the redux state

Check the following:

- Your feature's lifecycle plugin is properly plugged into the application lifecycle. Make sure it's actually emitting events over the port. `exodus.subscribe(console.log)` will log all events emitted to the port.
- You've included your feature's redux module in the UI side dependencies you pass to `@exodus/redux-dependency-injection`.
- Your redux module has reducers in `eventReducers` with keys matching the event names emitted by your plugin.
