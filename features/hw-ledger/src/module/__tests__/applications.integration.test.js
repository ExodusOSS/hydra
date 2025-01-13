import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

import { createApplicationManager } from '../management/application'

jest.setTimeout(60 * 1000)

describe.skip('applications', () => {
  let transport
  let api

  beforeEach(async () => {
    transport = await TransportNodeHid.create()
    api = await createApplicationManager(transport)
  })

  afterEach(async () => {
    await transport.close()
  })

  it('.listApplications()', async () => {
    const apps = await api.listApplications()
    expect(apps).toEqual([
      {
        name: 'Bitcoin',
        hash: '21b1ec9ed4792f21d83c98116a488a0ca450ae80ba170bf8803d9a3d6a66dc16',
        hash_code_data: 'efcd11f59b3031324556fc64cdf45bd7c4941908385b0dc4a978b71b722d0489',
        blocks: 2067,
        flags: 51_792,
      },
      {
        name: 'Ethereum',
        hash: '853889de4f85da3d6592261a38f5d6e94f63d43f81a2080f7983be1bdc3095dc',
        hash_code_data: '06c365a8c417f9a18f088f512e97fb24bec7b12ccb06c0211304868b19df857a',
        blocks: 2388,
        flags: 51_776,
      },
      {
        name: 'Solana',
        hash: 'e4c28a7f64fa5b356ee15190ba303bcf077f96d95736b1f11e45c587330d0e79',
        hash_code_data: '77c4234993b1f55cbe4def468ec8350fa611682de8472ccb5d5b7452be5b8486',
        blocks: 1474,
        flags: 51_712,
      },
      {
        name: 'Polygon',
        hash: '2a1dba8c42982cf5712b33a87d013148af7015a6d753ef4b408ae4e025d40692',
        hash_code_data: 'ac8954cb5ac8c18fd68eba1e57c4726c61c798b90f1017f05f5f5fdfdf39db53',
        blocks: 20,
        flags: 51_776,
      },
    ])
  })

  it('.getInformation()', async () => {
    const information = await api.getInformation()
    expect(information).toEqual({
      flags: Buffer.from('00', 'hex'),
      name: 'BOLOS',
      version: '1.1.0',
    })
  })

  it('.openApplication()', async () => {
    expect(async () => api.openApplication('Bitcoin')).not.toThrow()
  })

  it('.getInformation()', async () => {
    const information = await api.getInformation()
    expect(information).toEqual({
      flags: Buffer.from('02', 'hex'),
      name: 'Bitcoin',
      version: '2.1.3',
    })
  })

  it('.quitApplication()', async () => {
    expect(async () => api.quitApplication('Bitcoin')).not.toThrow()
  })
})
