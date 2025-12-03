import type { SentryError, EnvelopeHeader, ItemHeader, Envelope } from './types.js'

/*
  See https://develop.sentry.dev/sdk/data-model/envelopes/ for more details on the envelope format.
 */

const createEnvelopeHeader = ({ eventId }: { eventId: string }): EnvelopeHeader => {
  return { event_id: eventId }
}

const createItemHeader = (type: string): ItemHeader => {
  return {
    type,
  }
}

const serializeEnvelope = (
  envelopeHeader: EnvelopeHeader,
  itemHeader: ItemHeader,
  sentryError: SentryError
): string => {
  const headerStr = JSON.stringify(envelopeHeader)
  const itemHeaderStr = JSON.stringify(itemHeader)
  const eventPayload = JSON.stringify(sentryError)

  return `${headerStr}\n${itemHeaderStr}\n${eventPayload}`
}

export const createEnvelope = ({ sentryError }: { sentryError: SentryError }): Envelope => {
  const envelopeHeader = createEnvelopeHeader({ eventId: sentryError.event_id })
  const itemHeader = createItemHeader('event')

  return serializeEnvelope(envelopeHeader, itemHeader, sentryError) as Envelope
}
