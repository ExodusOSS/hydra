const { fetch } = require('@exodus/fetch')
const events = require('events')

jest.setTimeout(15_000)

global.fetch = fetch

events.setMaxListeners(Number.POSITIVE_INFINITY)
