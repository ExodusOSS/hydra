import typeforce from '@exodus/typeforce'
import { randomUUID } from '@exodus/crypto/randomUUID'
import formatStackFrames from './format-stack.js'
import { createEnvelope } from './envelope.js'
import type {
  JsEngine,
  SentryConfig,
  SentryError,
  SentryExceptionValue,
  ToSentryErrorParams,
  SentryConstructorOptions,
  SubmitEnvelopeFunction,
  UnsafeContext,
} from './types.js'
import { asRelativePath } from './utils.js'
import { SafeError, SafeContext } from '@exodus/errors'
import type { SafeContextType } from '@exodus/errors'

export type {
  JsEngine,
  Environment,
  SentryConfig,
  SentryStackFrame,
  SentryError,
  UnsafeContext,
} from './types.js'

const SPAN_ID_HEX_LENGTH = 16

const generateSpanId = (): string => randomUUID().replace(/-/gu, '').slice(0, SPAN_ID_HEX_LENGTH)

// Promote `context.traceId` into Sentry's `contexts.trace` so the trace id is indexed and
// searchable. A bare `contexts.traceId` is treated as decorative metadata and ignored by Sentry.
// https://develop.sentry.dev/sdk/data-model/event-payloads/contexts/#trace-context
const toSentryContexts = (safeContexts: SafeContextType) => {
  if (!safeContexts) return

  const { traceId, ...rest } = safeContexts
  if (!traceId) return safeContexts

  return {
    ...rest,
    trace: {
      trace_id: traceId.toString().toLowerCase(),
      span_id: generateSpanId(),
    },
  }
}

const toExceptionValue = (
  safeError: SafeError,
  jsEngine: JsEngine,
  mechanism?: SentryExceptionValue['mechanism']
): SentryExceptionValue => ({
  type: safeError.name,
  value: safeError.hint,
  // https://develop.sentry.dev/sdk/event-payloads/stacktrace/
  stacktrace: {
    frames: formatStackFrames({ frames: safeError.stackFrames ?? [], jsEngine }),
  },
  ...(mechanism && { mechanism }),
})

export const toSentryError = ({
  unsafeError,
  config,
  unsafeContext,
}: ToSentryErrorParams): SentryError | undefined => {
  const safeError = SafeError.from(unsafeError)
  if (!safeError.stackFrames?.length) {
    console.warn('Empty stack trace, see the `@exodus/errors` library for troubleshooting.')
    return
  }

  const contexts = toSentryContexts(SafeContext.parse(unsafeContext))

  // Sentry's Exception Interface expects chained exceptions ordered oldest first, so the
  // root cause leads and the thrown error is last. Keeping the thrown error last preserves
  // issue grouping, which keys off the final value.
  // https://develop.sentry.dev/sdk/data-model/event-payloads/exception/
  const exceptionValues: SentryExceptionValue[] = [
    ...(safeError.linkedErrors ?? [])
      // `source: 'cause'` tags each entry as acquired from the parent error's `cause`, so
      // Sentry renders the "caused by" relationship. `type` identifies the capturing
      // mechanism and must be 'generic' for user-invoked captures.
      // https://develop.sentry.dev/sdk/telemetry/errors/#exception-mechanism
      .map((linkedError) =>
        toExceptionValue(linkedError, config.jsEngine, { type: 'generic', source: 'cause' })
      )
      .reverse(),
    toExceptionValue(safeError, config.jsEngine),
  ]

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
      values: exceptionValues,
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
          environment: (value: unknown) =>
            ['development', 'staging', 'production'].includes(value as string),
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
    context?: UnsafeContext
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
