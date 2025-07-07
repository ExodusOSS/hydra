import kyc from '@exodus/kyc'
import { http } from 'msw'

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

const config = {
  ..._config,
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

const xonextBaseUrl = 'https://kyc-d.a.exodus.io'
const xonextRemoteConfigDefault = {
  version: 1,
  sandboxApiUrl: xonextBaseUrl,
  apiPath: '/api/v1',
}

const fixtures = [
  {
    name: 'kyc',
    baseUrl: xonextBaseUrl,
    fetchUserPath: '/api/v1/users/me',
    provider: 'xopay',
    config: {
      ...config,
      kycRemoteConfigAtom: xonextRemoteConfigDefault,
    },
    configOverrides: { apiUrl: xonextBaseUrl },
    apiVersion: 1,
    data: { data: { provider: 'xopay', status: 'none' } },
    response: { provider: 'xopay', status: 'none' },
  },
]

fixtures.forEach(
  ({ name, baseUrl, config, data, apiVersion, configOverrides, fetchUserPath, response }) => {
    describe(name, () => {
      let exodus

      let adapters

      let port

      let validResponse

      let token

      const passphrase = 'my-password-manager-generated-this'

      beforeEach(async () => {
        mswServer.use(
          http.get(`${baseUrl}${fetchUserPath}`, () => {
            if (validResponse) return jsonResponse(response)()

            return jsonResponse({ success: false }, 404)()
          })
        )

        validResponse = false

        adapters = createAdapters()

        port = adapters.port

        const container = createExodus({ adapters, config })

        container.use(kyc({ configOverrides, apiVersion }))

        exodus = container.resolve()

        await exodus.application.start()
        await exodus.application.create({ passphrase })
      })

      afterEach(async () => {
        await exodus.application.stop()
      })

      test('should load kyc data at start', async () => {
        await exodus.application.unlock({ passphrase })

        await expectEvent({ port, event: 'kyc', payload: { exists: false } })
      })

      test('should emit user if exists', async () => {
        await exodus.application.unlock({ passphrase })

        await expectEvent({ port, event: 'kyc', payload: { exists: false } })

        validResponse = true

        exodus.kyc.sync()

        await expectEvent({ port, event: 'kyc', payload: { exists: true, ...data } })
      })

      test('should request kyc token to api when requested', async () => {
        validResponse = true

        token =
          '188c79d7dddf72e3964a5a488de643f6470ca4cacb66dc8a8a7d49b67e71aded81af6f104e71a9ad7d1ad8705ab17c389d0e3db7cc1368a837232cbe415f0752b7bf4487e0676cf7d185ae03f14033ec5e607e5bee79016b8254a9ea45b83043deadeb509369112d921889f795bf7675ecfa252aa91820cb205b713b1ba02636df92d9857edeff4e8e05b9b4e6a1d13a6e499fb9cb02b1bf985cda6795738c9f716026'

        await exodus.application.unlock({ passphrase })

        await expect(exodus.kyc.requestKycToken({ purpose: 'referrals' })).resolves.toBe(token)
      })
    })
  }
)
