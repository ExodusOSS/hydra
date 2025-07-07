import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ModalMigrationWarningView',
    properties: {
      ...commonProps,
      network: 'bnbmainnet',
    },
  },
]

describe('ModalMigrationWarningView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ModalMigrationWarningView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ModalMigrationWarningView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ModalMigrationWarningView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ModalMigrationWarningView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_name: ['nano'] },
        })
      ).toThrow()
    })
  })
})
