# `@exodus/nfts-proxy`

Client for the [NFTs proxy server](https://nfts-proxy.exodus.io). This library should be used only to fetch NFTs data, in order to buy or list (among other things) an NFT, use this in combination with `@exodus/nfts-marketplaces`.

## Usage

```js
import { NftsProxyApi } from '@exodus/nfts-proxy'

// (Optional) set the `baseUrl`.
const nfts = new NftsProxyApi({ baseUrl: 'https://nfts-proxy.exodus.io' })

nfts.algorand.getNftsByOwner('SR4GMNHWMXVXJUGJUPPA3O53CBQCO2MTXRMASGHV3LIAGM7OZC76LWKSVQ')
// => Promise. Array of NFTs.

nfts.algorand.getNft(453046935)
// => Promise. Single NFT.

nfts.algorand.getNftImage(453046935, 256)
// => Promise. Canvas data for an NFT image.
```

## Networks

| Network       | Methods                                           |
| ------------- | ------------------------------------------------- |
| **Algorand**  | getNftsByOwner(`address`)                         |
|               | getNft(`tokenId`)                                 |
|               | getNftImage(`tokenId`, `size`)                    |
| **Avalanche** | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
| **BNB**       | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
| **Cardano**   | getNftsByOwner(`address`)                         |
|               | getNft(`tokenId`)                                 |
|               | getNftImage(`tokenId`, `size`)                    |
| **Ethereum**  | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
| **Fantom**    | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
| **Polygon**   | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
| **Solana**    | getNftsByOwner(`address`)                         |
|               | getNft(`mintAddress`)                             |
|               | getNftImage(`mintAddress`, `size`)                |
| **Tezos**     | getNftsByOwner(`address`)                         |
|               | getNft(`contractAddress`, `tokenId`)              |
|               | getNftImage(`contractAddress`, `tokenId`, `size`) |
