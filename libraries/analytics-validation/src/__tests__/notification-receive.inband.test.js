import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'NotificationReceive',
    properties: {
      ...commonProps,
      notification_id: '123',
      group: 'offers',
      push_or_in_app: 'push',
      cta: 'exchange',
      title: 'BTC is now available',
      country: 'US',
      exodus_activation_time: new Date().toISOString(),
      exodus_activation_time_user: new Date().toISOString(),
      user_time: new Date().toISOString(),
    },
  },
]

describe('NotificationReceive', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "NotificationReceive" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "NotificationReceive" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "NotificationReceive" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "NotificationReceive" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, group: 123 },
        })
      ).toThrow()
    })
  })
})
