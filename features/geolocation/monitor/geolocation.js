import delay from 'delay'
import pDefer from 'p-defer'
import { isEqual } from 'lodash'
import { retry } from '@exodus/simple-retry'
import createFetchival from '@exodus/fetch/experimental/create-fetchival'

export const MODULE_ID = 'geolocation'

class GeolocationMonitor {
  #url
  #geolocationAtom
  #started = false
  #loaded = pDefer()
  #fetchInterval
  #logger
  #getBuildMetadata
  #fetchival
  #appName
  #appVersion

  constructor({ geolocationAtom, config, logger, getBuildMetadata, fetch }) {
    this.#url = new URL(config.apiUrl)
    this.#fetchInterval = config.fetchInterval
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

      await delay(this.#fetchInterval)
    }
  }

  stop = () => {
    this.#started = false
  }
}

const createGeolocationMonitor = (args = {}) => new GeolocationMonitor({ ...args })

export default createGeolocationMonitor
