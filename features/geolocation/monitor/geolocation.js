import pDefer from 'p-defer'
import lodash from 'lodash'
import { retry } from '@exodus/simple-retry'
import createFetchival from '@exodus/fetch/experimental/create-fetchival'

const { isEqual } = lodash

export const MODULE_ID = 'geolocation'

class GeolocationMonitor {
  #url
  #geolocationAtom
  #started = false
  #hasRetrievedGeolocationOnce = false
  #loaded = pDefer()
  #fetchInterval
  #fetchIntervalUntilFirstSuccess
  #logger
  #getBuildMetadata
  #fetchival
  #appName
  #appVersion
  #timeout

  constructor({ geolocationAtom, config, logger, getBuildMetadata, fetch }) {
    this.#url = new URL(config.apiUrl)
    this.#fetchInterval = config.fetchInterval
    this.#fetchIntervalUntilFirstSuccess = config.fetchIntervalUntilFirstSuccess
    this.#geolocationAtom = geolocationAtom
    this.#logger = logger
    this.#getBuildMetadata = getBuildMetadata
    this.#fetchival = createFetchival({ fetch })
  }

  #fetchWithRetry = retry(
    async () =>
      this.#fetchival(this.#url, {
        headers: { 'App-Name': this.#appName, 'App-Version': this.#appVersion },
      }).get(),
    { delayTimesMs: ['2s', '5s'] }
  )

  #fetch = async () => {
    try {
      if (!this.#appName || !this.#appVersion) {
        const buildMetadata = await this.#getBuildMetadata()
        this.#appName = buildMetadata.appId
        this.#appVersion = buildMetadata.version
      }

      const data = await this.#fetchWithRetry()

      if (data.regionCode === '') {
        delete data.regionCode
      }

      await this.#geolocationAtom.set((current) => (isEqual(current, data) ? current : data))
      this.#hasRetrievedGeolocationOnce = true
    } catch {
      const data = { error: 'Getting location failed.' }
      await this.#geolocationAtom.set((current) => (isEqual(current, data) ? current : data))
    }

    this.#loaded.resolve()
  }

  start = async () => {
    if (this.#started) return

    this.#started = true

    while (this.#started) {
      try {
        await this.#fetch()
      } catch (err) {
        this.#logger.error(err)
      }

      if (!this.#started) break
      await new Promise((resolve) => {
        this.#timeout = setTimeout(
          resolve,
          // In case we have never retrieved geolocation (e.g device offline), we use the aggressive fetch interval
          // to ensure we get the location as soon as possible so fiat on-ramps can work.
          this.#hasRetrievedGeolocationOnce
            ? this.#fetchInterval
            : this.#fetchIntervalUntilFirstSuccess
        )
      })
    }
  }

  stop = () => {
    this.#started = false
    this.#hasRetrievedGeolocationOnce = false
    clearTimeout(this.#timeout)
  }
}

const createGeolocationMonitor = (args = {}) => new GeolocationMonitor({ ...args })

export default createGeolocationMonitor
