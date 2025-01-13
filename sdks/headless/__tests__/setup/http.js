import { setupServer } from 'msw/node'

import handlers from './handlers'

const mswServer = setupServer(...handlers)

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))

afterEach(() => mswServer.resetHandlers())

export default mswServer
