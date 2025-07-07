import kyc from '@exodus/kyc'
import referrals from '@exodus/referrals'
import { http, HttpResponse } from 'msw'

import createAdapters from './adapters/index.js'
import _config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'
import { jsonResponse } from './setup/handlers/utils.js'
import mswServer from './setup/http.js'

const featureFlagsConfig = {
  referrals: {
    localDefaults: {
      available: true,
      enabled: true,
    },
  },
}

const baseUrl = _config.referrals.API_URL
const config = {
  ..._config,
  referralsClient: {
    apiUrl: baseUrl,
  },
  remoteConfigFeatureFlagAtoms: {
    features: featureFlagsConfig,
  },
  featureFlagAtoms: {
    features: featureFlagsConfig,
  },
  featureFlags: {
    features: featureFlagsConfig,
  },
}

describe('referrals', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(kyc({ apiVersion: 1 }))
    container.use(referrals())
    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ passphrase })
  })

  afterEach(async () => {
    await exodus.application.stop()
  })

  test('should load referrals data at start', async () => {
    const user = {
      hasAlgoPayoutHistory: undefined,
      isReferee: false,
      referralCode: 'U6WP58',
      rewardPercentage: 0.8,
      badgedAssets: ['bitcoin'],
      referralSwapLimit: undefined,
      referrals: undefined,
      referredBy: undefined,
      rewardsPendingKyc: false,
      userProvidedGeo: undefined,
    }

    mswServer.use(http.get(`${baseUrl}/api/whoami`, jsonResponse({ success: true, user })))

    await exodus.application.unlock({ passphrase })

    await expectEvent({
      port,
      event: 'referrals',
      payload: user,
    })
  })

  test('should set referred by code', async () => {
    const user = {
      hasAlgoPayoutHistory: undefined,
      isReferee: true,
      referralCode: 'U6WP58',
      referralSwapLimit: undefined,
      referrals: undefined,
      referredBy: 'VOLDY',
      rewardPercentage: 0.8,
      badgedAssets: ['bitcoin'],
      rewardsPendingKyc: true,
      userProvidedGeo: 'US',
    }

    let callTimes = 0

    mswServer.use(
      http.get(`${baseUrl}/api/whoami`, async (req) => {
        callTimes++

        if (callTimes === 1) {
          return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({ success: true, user })
      }),
      http.post(`${baseUrl}/api/signup`, jsonResponse({ success: true }))
    )

    await exodus.referrals.setReferredBy('VOLDY')
    await exodus.application.unlock({ passphrase })

    await expectEvent({
      port,
      event: 'referrals',
      payload: user,
    })
  })

  test('should query if code is valid', async () => {
    mswServer.use(
      http.get(`${baseUrl}/api/referral-code`, ({ request }) => {
        const code = new URL(request.url).searchParams.get('code')
        const exists = code === 'HARRY'

        return jsonResponse({ success: true, data: { exists } })()
      })
    )

    await expect(exodus.referrals.referralCodeExists('HARRY')).resolves.toBe(true)
    await expect(exodus.referrals.referralCodeExists('VOLDY')).resolves.toBe(false)
  })
})
