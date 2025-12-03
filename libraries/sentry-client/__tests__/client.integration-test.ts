import { createRequire } from 'node:module'

import createSentryClient from '../src/index.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

if (!process.env.SENTRY_PUBLIC_KEY) {
  throw new Error(
    'SENTRY_PUBLIC_KEY env var is required, get it from https://exodus-movement-inc.sentry.io/settings/projects/exodus-rn/'
  )
}

if (!process.env.SENTRY_AUTH_TOKEN) {
  throw new Error(
    'SENTRY_AUTH_TOKEN env var is required, get it from : https://exodus-movement-inc.sentry.io/settings/developer-settings/sentry-client-integration-testing-fc551a/'
  )
}

const config = {
  dsnUrl: 'https://o169923.ingest.us.sentry.io',
  publicKey: process.env.SENTRY_PUBLIC_KEY,
  projectId: '1321706',
  environment: 'staging',
  os: 'test',
  osVersion: '1.0.0',
  platform: 'test',
  appName: 'sentry-client',
  appVersion: pkg.version,
  buildId: '123',
  jsEngine: 'hermes',
} as const

const client = createSentryClient({
  config,
})

test('integration test', async () => {
  const result = await client.captureError({
    error: new Error('boo'),
  })

  expect(typeof result.eventId).toEqual('string')
})
