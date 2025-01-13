import announcements from '@exodus/announcements'
import { waitUntil } from '@exodus/atoms'
import { http } from 'msw'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import { jsonResponse } from './setup/handlers/utils'
import mswServer from './setup/http'

const url = 'https://remote-config.exodus.io/v2/announcements.json'

describe('announcements', () => {
  let adapters

  let port

  beforeEach(async () => {
    adapters = createAdapters()
    port = adapters.port
  })

  test('announcements integration example', async () => {
    mswServer.use(
      http.get(
        url,
        jsonResponse([
          {
            title: 'Augur Upgrade Notice',
            message:
              'Augur recently completed a network upgrade. All Augur funds remain safe. To continue using Augur in Exodus please upgrade to the latest version at https://exodus.com/download/.',
            id: '7',
            conditions: ['augurBalance', '<1.55.3'],
            force: true,
          },
        ])
      )
    )

    const container = createExodus({
      adapters,
      config: {
        ...config,
        announcements: {
          url,
          // defaults you can override
          maxRetries: 2,
          retryDelay: 1000,
        },
        announcementsFiltersAtom: {},
      },
      port,
    })

    container.use(announcements())

    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create()
    await exodus.application.unlock()

    const allAnnouncementsAtom = container.get('allAnnouncementsAtom')
    await waitUntil({
      atom: allAnnouncementsAtom,
      predicate: (value) => value.length === 1 && value[0].id === '7',
    })

    await expect(exodus.announcements.dispose('7')).resolves.not.toThrow()
  })
})
