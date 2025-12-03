import typeforce from '@exodus/typeforce'
import { randomUUID } from '@exodus/crypto/randomUUID'
import formatStackFrames from './format-stack.js'
import { createEnvelope } from './envelope.js'
import type {
  SentryConfig,
  SentryError,
  ToSentryErrorParams,
  SentryConstructorOptions,
  SubmitEnvelopeFunction,
  UnsafeContext,
} from './types.js'
import { asRelativePath } from './utils.js'
import { SafeError, SafeContext } from '@exodus/errors'

export type {
  JsEngine,
  Environment,
  SentryConfig,
  SentryStackFrame,
  SentryError,
  UnsafeContext,
} from './types.js'

export const toSentryError = ({
  unsafeError,
  config,
  unsafeContext,
}: ToSentryErrorParams): SentryError | undefined => {
  const safeError = SafeError.from(unsafeError)
  if (safeError.stackFrames?.length === 0) {
    console.warn('Empty stack trace, see the `@exodus/errors` library for troubleshooting.')
    return
  }

  // https://develop.sentry.dev/sdk/event-payloads/
  const frames = formatStackFrames({
    frames: safeError.stackFrames!,
    jsEngine: config.jsEngine,
  })

  const contexts = SafeContext.parse(unsafeContext)

  return {
    event_id: randomUUID().replace(/-/gu, ''),
    timestamp: Math.trunc(Date.now() / 1000),
    platform: 'javascript',
    level: 'error', // fatal | error | warning | info | debug
    // logger: 'mobile.exodus',
    // "transaction": "/users/<username>/"
    release: `${config.appName}@${config.appVersion}`,
    dist: config.buildId,
    tags: {
      os: config.os,
      osVersion: config.osVersion,
      platform: config.platform,
      appVersion: config.appVersion,
    },
    environment: config.environment,
    ...(contexts && { contexts }),
    // list of relevant modules
    // modules: {
    //   'my.module.name': '1.0',
    // },
    // arbitrary metadata
    // A list of strings used to dictate the deduplication of this event.
    // fingerprint: ['myrpc', 'POST', '/foo.bar'],

    // Sentry's Exception Interface
    // https://develop.sentry.dev/sdk/event-payloads/exception/
    exception: {
      values: [
        {
          type: safeError.name,
          value: safeError.hint,
          // https://develop.sentry.dev/sdk/event-payloads/stacktrace/
          stacktrace: {
            frames,
          },
        },
      ],
    },
  }
}

class Sentry {
  #fetch: SubmitEnvelopeFunction
  #config: SentryConfig
  constructor(opts: SentryConstructorOptions) {
    typeforce(
      {
        config: {
          publicKey: 'String',
          projectId: 'String',
          environment: (value: unknown) => ['staging', 'production'].includes(value as string),
          dsnUrl: 'String',
          os: 'String',
          osVersion: 'String',
          platform: 'String',
          // these are used to define the Sentry release
          appName: 'String',
          appVersion: 'String',
          buildId: 'String',
          jsEngine: (value: unknown) => ['jsc', 'hermes'].includes(value as string),
        },
      },
      opts
    )

    const { config } = opts
    const { dsnUrl, publicKey } = config

    this.#config = config
    this.#fetch = (relativePath, { body }) =>
      globalThis.fetch(new URL(relativePath, dsnUrl), {
        method: 'POST',
        headers: {
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${publicKey}`,
          'Content-Type': 'application/x-sentry-envelope',
        },
        body,
      })
  }

  // Renaming to 'unsafeError' just to explicitly state that any of its properties should not be used for tracking.
  captureError = async ({
    error: unsafeError,
    context: unsafeContext,
  }: {
    error: Error
    context: UnsafeContext
  }): Promise<{ eventId: string }> => {
    if (!(unsafeError instanceof Error)) {
      throw new TypeError("'error' must be an Error instance.")
    }

    const sentryError = toSentryError({
      unsafeError,
      config: this.#config,
      unsafeContext,
    })

    if (!sentryError) {
      throw new Error('failed to parse error stack', { cause: unsafeError })
    }

    const envelope = createEnvelope({
      sentryError,
    })

    await this.#fetch(
      asRelativePath(`api/${encodeURIComponent(this.#config.projectId)}/envelope/`),
      {
        body: envelope,
      }
    )

    return { eventId: sentryError.event_id }
  }
}

const createSentryClient = (opts: SentryConstructorOptions): Sentry => new Sentry(opts)

export default createSentryClient
