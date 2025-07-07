import { fetch } from '@exodus/fetch'
import EventEmitter from 'events' // eslint-disable-line @exodus/restricted-imports/no-node-core-events

jest.setTimeout(15_000)

globalThis.fetch = fetch

EventEmitter.setMaxListeners(Number.POSITIVE_INFINITY)

global.__DEV__ = true
