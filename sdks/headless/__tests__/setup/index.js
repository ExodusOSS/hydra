import EventEmitter from 'events' // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/no-node-core-events

jest.setTimeout(15_000)

EventEmitter.setMaxListeners(Number.POSITIVE_INFINITY)

global.__DEV__ = true
