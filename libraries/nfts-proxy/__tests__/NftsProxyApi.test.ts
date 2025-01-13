import { NftsProxyApi } from '../src/index.js'

const BASE_URL = 'https://nfts-proxy-d.exodus.io/v2'

describe('NftsProxy', () => {
  const nftsProxy = new NftsProxyApi({ baseUrl: BASE_URL })

  it('decomposeId', () => {
    const contractAddress = '0xe125c05e771b887c702b0d4f5c5e8f933bf4ac71'
    const tokenId = '1000'
    const evmsExpectedResponse = { contractAddress, tokenId }

    expect(nftsProxy.decomposeId('algorand:453046935')).toEqual({
      network: 'algorand',
      tokenId: '453046935',
    })

    expect(nftsProxy.decomposeId(`avalanche:${contractAddress}/${tokenId}`)).toEqual({
      network: 'avalanche',
      ...evmsExpectedResponse,
    })

    expect(nftsProxy.decomposeId(`bnb:${contractAddress}/${tokenId}`)).toEqual({
      network: 'bnb',
      ...evmsExpectedResponse,
    })

    expect(
      nftsProxy.decomposeId(
        'cardano:aa63d7de85fb677012ab0f3effa8ea1475d569c3801420b475efaefa55474c593033343636'
      )
    ).toEqual({
      network: 'cardano',
      tokenId: 'aa63d7de85fb677012ab0f3effa8ea1475d569c3801420b475efaefa55474c593033343636',
    })

    expect(nftsProxy.decomposeId(`ethereum:${contractAddress}/${tokenId}`)).toEqual({
      network: 'ethereum',
      ...evmsExpectedResponse,
    })

    expect(nftsProxy.decomposeId(`fantom:${contractAddress}/${tokenId}`)).toEqual({
      network: 'fantom',
      ...evmsExpectedResponse,
    })

    expect(nftsProxy.decomposeId(`polygon:${contractAddress}/${tokenId}`)).toEqual({
      network: 'polygon',
      ...evmsExpectedResponse,
    })

    expect(nftsProxy.decomposeId(`tezos:KT1DeNSXrUnk9DiXw88Qr5ZTMqzqWGYD3nmX/1`)).toEqual({
      network: 'tezos',
      contractAddress: 'KT1DeNSXrUnk9DiXw88Qr5ZTMqzqWGYD3nmX',
      tokenId: '1',
    })
  })

  it('getNftImageUrl', () => {
    const contractAddress = '0xe125c05e771b887c702b0d4f5c5e8f933bf4ac71'
    const tokenId = '1000'
    const algorandNftId = 'algorand:453046935'

    const testData = [
      { nftId: algorandNftId, size: 256, fetchQoi: true },
      { nftId: algorandNftId, size: 128, fetchQoi: false },
      { nftId: `avalanche:${contractAddress}/${tokenId}`, size: 128, fetchQoi: false },
      { nftId: `bnb:${contractAddress}/${tokenId}`, size: 128, fetchQoi: false },
      {
        nftId: 'cardano:aa63d7de85fb677012ab0f3effa8ea1475d569c3801420b475efaefa55474c593033343636',
        size: 768,
        fetchQoi: true,
      },
      { nftId: `polygon:${contractAddress}/${tokenId}`, size: 768 },
      { nftId: `fantom:${contractAddress}/${tokenId}`, size: 768 },
      { nftId: `ethereum:${contractAddress}/${tokenId}`, size: 768 },
      { nftId: `tezos:KT1DeNSXrUnk9DiXw88Qr5ZTMqzqWGYD3nmX/1`, size: 256, fetchQoi: true },
      { nftId: 'solana:HBcAuvSHF9NnE2e8oKMUzosnEKNsm3bXJMWjusn7UbRa', size: 256, fetchQoi: true },
    ]

    const results = testData.map(({ nftId, size, fetchQoi }) =>
      nftsProxy.getNftImageUrl(nftId, size, { fetchQoi })
    )
    expect(results).toMatchSnapshot()
  })

  expect(nftsProxy.decomposeId('solana:HBcAuvSHF9NnE2e8oKMUzosnEKNsm3bXJMWjusn7UbRa')).toEqual({
    network: 'solana',
    mintAddress: 'HBcAuvSHF9NnE2e8oKMUzosnEKNsm3bXJMWjusn7UbRa',
  })

  describe('getNftImageUrl', () => {
    it('solana, no QOI', async () => {
      const nftId = 'solana:HBcAuvSHF9NnE2e8oKMUzosnEKNsm3bXJMWjusn7UbRa'
      const response = nftsProxy.getNftImageUrl(nftId, 256)
      expect(response).toMatch(
        `${BASE_URL}/solana/nfts/HBcAuvSHF9NnE2e8oKMUzosnEKNsm3bXJMWjusn7UbRa/256`
      )
    })

    it('ethereum, QOI', async () => {
      const nftId = 'ethereum:0x45fb0ebeb161f175c4b2e7e3b5799e97d656ee3b/1'
      const response = nftsProxy.getNftImageUrl(nftId, 256, { fetchQoi: true })
      expect(response).toMatch(
        `${BASE_URL}/ethereum/nfts/0x45fb0ebeb161f175c4b2e7e3b5799e97d656ee3b/1/256?qoi=true`
      )
    })
  })
})
