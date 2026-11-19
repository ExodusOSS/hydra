import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayContactsInviteShareTap',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayContactsInviteShareTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayContactsInviteShareTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayContactsInviteShareTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayContactsInviteShareTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
