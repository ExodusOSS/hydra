import { createApplicationManager as applicationsFactory } from '../management/application.js'

const mockTransport = {
  send: jest.fn(),
}

describe('applications', () => {
  let applications: Awaited<ReturnType<typeof applicationsFactory>>
  beforeAll(async () => {
    applications = await applicationsFactory(mockTransport)
  })

  describe('getInformation()', () => {
    it('should work', async () => {
      const apdu = Buffer.from('0105424f4c4f5305312e312e309000', 'hex')
      mockTransport.send.mockResolvedValueOnce(apdu)
      const information = await applications.getInformation()
      expect(information).toEqual({
        flags: Buffer.from('00', 'hex'),
        name: 'BOLOS',
        version: '1.1.0',
      })
    })
  })

  describe('.listApplications()', () => {
    it('should work', async () => {
      const apdus = [
        '014d0813ca50efcd11f59b3031324556fc64cdf45bd7c4941908385b0dc4a978b71b722d048921b1ec9ed4792f21d83c98116a488a0ca450ae80ba170bf8803d9a3d6a66dc1607426974636f696e4e0954ca4006c365a8c417f9a18f088f512e97fb24bec7b12ccb06c0211304868b19df857a853889de4f85da3d6592261a38f5d6e94f63d43f81a2080f7983be1bdc3095dc08457468657265756d9000',
        '014c05c2ca0077c4234993b1f55cbe4def468ec8350fa611682de8472ccb5d5b7452be5b8486e4c28a7f64fa5b356ee15190ba303bcf077f96d95736b1f11e45c587330d0e7906536f6c616e614d0014ca40ac8954cb5ac8c18fd68eba1e57c4726c61c798b90f1017f05f5f5fdfdf39db532a1dba8c42982cf5712b33a87d013148af7015a6d753ef4b408ae4e025d4069207506f6c79676f6e9000',
        '9000',
      ].map((apdu) => Buffer.from(apdu, 'hex'))
      apdus.forEach((apdu) => mockTransport.send.mockResolvedValueOnce(apdu))
      const apps = await applications.listApplications()
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
  })

  describe('.openApplication()', () => {
    it('should work', async () => {
      const apdu = Buffer.from('9000', 'hex')
      mockTransport.send.mockResolvedValueOnce(apdu)
      expect(async () => applications.openApplication('Bitcoin')).not.toThrow()
    })
  })

  describe('.quitApplication()', () => {
    it('should work', async () => {
      const apdu = Buffer.from('9000', 'hex')
      mockTransport.send.mockResolvedValueOnce(apdu)
      expect(async () => applications.quitApplication()).not.toThrow()
    })
  })
})
