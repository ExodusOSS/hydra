import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsInviteModalView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsInviteModalView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsInviteModalView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsInviteModalView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsInviteModalView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
