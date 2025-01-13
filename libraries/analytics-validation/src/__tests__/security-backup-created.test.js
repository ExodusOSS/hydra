import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SecurityBackupCreated',
    properties: {
      ...commonProps,
      backup_type: 'passkeys',
    },
  },
]

describe('SecurityBackupCreated', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SecurityBackupCreated" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SecurityBackupCreated" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SecurityBackupCreated" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SecurityBackupCreated" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, backup_type: 'cat' } })
      ).toThrow()
    })
  })
})
