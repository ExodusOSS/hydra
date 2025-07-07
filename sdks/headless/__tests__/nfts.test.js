import nfts from '@exodus/nfts'
import lodash from 'lodash'

import createAdapters from './adapters/index.js'
import _config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'
import { BASE_URL, TEST_NFTS, TEST_TXS } from './fixtures/nfts.js'

const { isEmpty } = lodash

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

  afterEach(() => exodus.application.stop())

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
