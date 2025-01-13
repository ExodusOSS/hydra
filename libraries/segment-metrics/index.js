const { v4: uuidv4 } = require('uuid')
const camelCase = require('camelcase')
const createFetchival = require('@exodus/fetch/experimental/create-fetchival')

const { snakeCase, shallowMerge, omitUndefined } = require('./utils')

const noopLogger = { debug: () => {}, log: () => {}, error: () => {}, warn: () => {} }

const noopValidator = () => {}

function toHttpsUrl(s) {
  const parsedUrl = new URL(s)
  if (parsedUrl.protocol !== 'https:') {
    throw new URIError(`provided url's protocol (${parsedUrl.protocol}) must be https`)
  }

  return parsedUrl
}

module.exports = class Tracker {
  #encodedWriteKey
  #parsedApiBaseUrl
  #logger
  #validateEvent
  #getBuildMetadata
  #fetchival

  constructor({
    writeKey,
    apiBaseUrl,
    logger = noopLogger,
    validateEvent = noopValidator,
    getBuildMetadata,
    fetch,
  }) {
    if (typeof validateEvent !== 'function')
      throw new TypeError('validateEvent must be function if provided')

    this.#encodedWriteKey = Buffer.from(`${writeKey}:`).toString('base64')
    this.#parsedApiBaseUrl = toHttpsUrl(apiBaseUrl)
    this.#logger = logger
    this.#validateEvent = validateEvent
    this.#getBuildMetadata = getBuildMetadata
    this.#fetchival = createFetchival({ fetch })
  }

  defaultProperties = Object.create(null)
  errorProperties = Object.create(null)
  anonymousId = uuidv4()
  #userId = null

  getAnonymousId() {
    return this.anonymousId
  }

  setAnonymousId(value) {
    this.anonymousId = value
  }

  setUserId(value) {
    this.#userId = value
  }

  setDefaultProperty(key, value) {
    this.defaultProperties[snakeCase(key)] = value
  }

  setDefaultProperties(props) {
    this.defaultProperties = shallowMerge(this.defaultProperties, props)
    return this.defaultProperties
  }

  removeDefaultProperty(key) {
    delete this.defaultProperties[snakeCase(key)]
  }

  removeAllDefaultProperties() {
    this.defaultProperties = Object.create(null)
  }

  setDefaultPropertiesForSanitizationErrors(props) {
    this.errorProperties = shallowMerge(this.errorProperties, props)
    return this.errorProperties
  }

  #getEventToSave = async ({
    userId = this.#userId,
    anonymousId = this.anonymousId,
    event = 'UnknownEvent',
    properties = {},
    sensitive = false,
    timestamp,
    exactTimestamp = true,
  }) => {
    const eventToSave = {
      anonymousId,
      userId,
      event: camelCase(event, { pascalCase: true }),
      properties: omitUndefined(shallowMerge(this.defaultProperties, properties)),
    }

    const { dev } = await this.#getBuildMetadata()
    try {
      this.#validateEvent({ event: eventToSave.event, properties: eventToSave.properties })
    } catch (error) {
      this.#logger.error('invalid event', eventToSave, error)
      const message = dev
        ? error.message
        : error.name === 'SchemaSafeValidationError' && error.keyword && error.instanceLocation
          ? `Validation failed for ${error.keyword} at ${error.instanceLocation}`
          : error.name
      return {
        event: 'SanitizationError',
        anonymousId: this.anonymousId,
        properties: omitUndefined(
          shallowMerge(this.errorProperties, {
            event: eventToSave.event,
            message,
          })
        ),
      }
    }

    if (sensitive) {
      eventToSave.anonymousId = uuidv4()
    }

    const eventTimestamp = new Date(timestamp || Date.now())

    // if flag is set to not track exact time, set time to beginning of day
    if (!exactTimestamp) {
      eventTimestamp.setUTCHours(0, 0, 0)
    }

    eventToSave.timestamp = eventTimestamp.toUTCString()

    return eventToSave
  }

  #getTraitsToSave = ({
    userId = this.#userId,
    anonymousId = this.anonymousId,
    traits = {},
    timestamp,
  }) => {
    const traitsToSave = {
      userId,
      anonymousId,
      traits: shallowMerge(Object.create(null), traits),
    }

    const identifyTimestamp = new Date(timestamp || Date.now())

    traitsToSave.timestamp = identifyTimestamp.toUTCString()

    return traitsToSave
  }

  async track(args) {
    const event = await this.#getEventToSave(args)
    const headers = { Authorization: `Basic ${this.#encodedWriteKey}` }
    const trackUrl = new URL('track', this.#parsedApiBaseUrl)

    this.#logger.debug('event', event.event, event)

    return this.#fetchival(trackUrl, { headers }).post(event)
  }

  async identify(args) {
    const traits = this.#getTraitsToSave(args)
    const headers = { Authorization: `Basic ${this.#encodedWriteKey}` }
    const identifyUrl = new URL('identify', this.#parsedApiBaseUrl)

    return this.#fetchival(identifyUrl, { headers }).post(traits)
  }
}
