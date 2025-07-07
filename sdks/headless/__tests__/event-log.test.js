import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('eventLog', () => {
  let exodus
  let reportNode
  let eventLogAtom

  const passphrase = 'exceptionally-complex-secret'

  const events = [
    {
      event: 'build_changed',
    },
    {
      event: 'refresh-networks',
    },
  ]

  beforeEach(async () => {
    const adapters = createAdapters()
    const port = adapters.port
    const container = createExodus({ adapters, config, port })

    exodus = container.resolve()
    reportNode = container.getByType('report').eventLogReport
    eventLogAtom = container.get('eventLogAtom')

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
  })

  afterEach(() => exodus.application.stop())

  it('should record events to the event log', async () => {
    const initialEvents = await eventLogAtom.get()
    const initialLength = initialEvents.length

    for (const event of events) {
      await exodus.eventLog.record(event)

      const currentEvents = await eventLogAtom.get()
      const latestEvent = currentEvents[currentEvents.length - 1]

      expect(latestEvent.event).toBe(event.event)
      // The feature adds these properties automatically.
      expect(latestEvent).toHaveProperty('timestamp')
      expect(latestEvent).toHaveProperty('version')
      expect(latestEvent).toHaveProperty('build')
    }

    const finalEvents = await eventLogAtom.get()
    expect(finalEvents.length).toBe(initialLength + events.length)
  })

  it('should successfully export report', async () => {
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      eventLog: await reportNode.export(),
    })

    await Promise.all(events.map(async (event) => exodus.eventLog.record(event)))

    const finalReport = await exodus.reporting.export()

    expect(finalReport.eventLog).toEqual(await reportNode.export())

    for (const originalEvent of events) {
      // For each original event we recorded, find a matching event in the export.
      expect(
        finalReport.eventLog.some((exportedEvent) => exportedEvent.event === originalEvent.event)
      ).toBe(true, `Event "${originalEvent.event}" was not found in the exported data`)
    }

    // Verify events have the required schema properties.
    for (const exportedEvent of finalReport.eventLog) {
      expect(exportedEvent).toHaveProperty('event')
      expect(exportedEvent).toHaveProperty('timestamp')
      expect(exportedEvent).toHaveProperty('version')
    }
  })
})
