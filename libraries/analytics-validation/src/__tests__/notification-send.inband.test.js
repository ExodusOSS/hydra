import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'NotificationSend',
    properties: {
      ...commonProps,
      notification_id: '123',
      push_or_in_app: 'push',
      cta: 'exchange',
      title: 'BTC is now available',
      exodus_activation_time: new Date().toISOString(),
      exodus_activation_time_user: new Date().toISOString(),
      delivered_time: new Date().toISOString(),
      delivered_time_user: new Date().toISOString(),
      user_time: new Date().toISOString(),
    },
  },
]

describe('NotificationSend', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "NotificationSend" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "NotificationSend" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "NotificationSend" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "NotificationSend" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, notification_id: 123 },
        })
      ).toThrow()
    })
  })
})
