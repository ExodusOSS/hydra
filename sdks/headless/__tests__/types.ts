import abTesting from '@exodus/ab-testing'

import createExodus from '../src/index.js'

const exodus = createExodus({ config: {}, adapters: {} }).use(abTesting()).resolve()

// @ts-expect-error - wrong parameter type
void exodus.abTesting.trackEvent('event')

// infers types for features registered outside headless
void exodus.abTesting.trackEvent({
  type: 'event',
  experimentId: 'abc',
  value: true,
  unique: true,
  strategy: 'override',
})

// has types for features registered inside headless
void exodus.locale.setLanguage('de')
