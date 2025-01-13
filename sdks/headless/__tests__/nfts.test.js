import nfts from '@exodus/nfts'
import { isEmpty } from 'lodash'

import createAdapters from './adapters'
import _config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'
import { BASE_URL, TEST_NFTS, TEST_TXS } from './fixtures/nfts'

const config = { ..._config, nftsProxy: { baseUrl: BASE_URL }, nftsMonitor: {} }

describe('nfts', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'
  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(nfts())

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ mnemonic, passphrase })
  })

  test('should emit nfts after unlock', async () => {
    const txsEvent = expectEvent({ port, event: 'nftsTxs', predicate: (v) => !isEmpty(v) })
    const nftsEvent = expectEvent({ port, event: 'nfts', predicate: (v) => !isEmpty(v) })

    await exodus.application.unlock({ passphrase })

    const [txsPayload, nftsPayload] = await Promise.all([txsEvent, nftsEvent])

    expect(nftsPayload).toEqual({ exodus_0: { ethereum: TEST_NFTS } })
    expect(txsPayload).toEqual({ exodus_0: { ethereum: TEST_TXS } })

    exodus.application.unload()
  })
})
