import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'RestoreBackupWarningModalView',
    properties: {
      ...commonProps,
      tapped_someone_else: true,
    },
  },
  {
    event: 'RestoreBackupWarningModalView',
    properties: {
      ...commonProps,
      tapped_someone_else: false,
    },
  },
]

describe('RestoreBackupWarningModalView', () => {
  fixtures.forEach((event) => {
    it(`The main schema validates "RestoreBackupWarningModalView" event with tapped_someone_else: ${event.properties.tapped_someone_else}`, () => {
      expect(validate(event)).toEqual(event)
    })

    it(`The main schema rejects unexpected properties of "RestoreBackupWarningModalView" event with tapped_someone_else: ${event.properties.tapped_someone_else}`, () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it(`The main schema rejects unexpected properties in "properties" of "RestoreBackupWarningModalView" event with tapped_someone_else: ${event.properties.tapped_someone_else}`, () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it(`Should reject "RestoreBackupWarningModalView" property of invalid format with tapped_someone_else: ${event.properties.tapped_someone_else}`, () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, tapped_someone_else: 'cat' },
        })
      ).toThrow()
    })
  })
})
