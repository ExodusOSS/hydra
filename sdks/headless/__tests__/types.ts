import abTesting from '@exodus/ab-testing'

import createExodus from '../src'

const exodus = createExodus({ config: {}, adapters: {} }).use(abTesting()).resolve()

// @ts-expect-error - wrong parameter type
exodus.abTesting.trackEvent('event')

// infers types for features registered outside headless
exodus.abTesting.trackEvent({
  type: 'event',
  experimentId: 'abc',
  value: true,
  unique: true,
  strategy: 'override',
})

// has types for features registered inside headless
exodus.locale.setLanguage('de')
