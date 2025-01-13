import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SecurityBackupCreationInitiated',
    properties: {
      ...commonProps,
      backup_type: 'passkeys',
    },
  },
]

describe('SecurityBackupCreationInitiated', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SecurityBackupCreationInitiated" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SecurityBackupCreationInitiated" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SecurityBackupCreationInitiated" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SecurityBackupCreationInitiated" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, backup_type: 'cat' } })
      ).toThrow()
    })
  })
})
